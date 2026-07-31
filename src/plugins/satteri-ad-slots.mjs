import { defineHastPlugin } from 'satteri';

/**
 * Insere blocos de anúncio dentro do corpo do artigo em tempo de build.
 *
 * Por que no build e não no cliente: o `<ins>` do AdSense precisa existir no
 * HTML entregue, dentro de um container com altura já reservada. Inserir o
 * bloco via JavaScript depois do primeiro paint empurraria o texto para baixo
 * — Cumulative Layout Shift, que penaliza tanto o Core Web Vitals quanto a
 * qualidade percebida do inventário no leilão do AdSense.
 *
 * Posições:
 *   - `in-article`  — logo após o 2º parágrafo de primeiro nível
 *   - `mid-content` — no ponto médio do artigo
 *
 * Artigos curtos não recebem anúncio no meio: dois blocos colados num texto de
 * 400 palavras é exatamente o padrão que a revisão manual do AdSense reprova.
 *
 * @import { HastPluginDefinition } from 'satteri'
 * @import { Element } from 'hast'
 */

/** Nº mínimo de parágrafos para inserir o bloco após o 2º parágrafo. */
const MIN_PARAGRAPHS_IN_ARTICLE = 5;
/** Nº mínimo de parágrafos para também inserir o bloco do meio. */
const MIN_PARAGRAPHS_MID_CONTENT = 12;

/**
 * @param {string} client   Client ID (`ca-pub-...`)
 * @param {string} slot     Slot ID numérico da unidade
 * @param {string} position Identificador da posição, usado no CSS e em métricas
 * @returns {Element}
 */
function createAdNode(client, slot, position) {
  return {
    type: 'element',
    tagName: 'aside',
    properties: {
      class: `ad-slot ad-slot--${position}`,
      'aria-label': 'Publicidade',
      'data-ad-position': position,
    },
    children: [
      {
        type: 'element',
        tagName: 'span',
        properties: { class: 'ad-slot__label' },
        children: [{ type: 'text', value: 'Publicidade' }],
      },
      {
        type: 'element',
        tagName: 'ins',
        properties: {
          class: 'adsbygoogle',
          'data-ad-client': client,
          'data-ad-slot': slot,
          'data-ad-format': 'auto',
          'data-full-width-responsive': 'true',
        },
        children: [],
      },
    ],
  };
}

/**
 * @param {object} [options]
 * @param {string | undefined} [options.client] `PUBLIC_ADSENSE_CLIENT`
 * @param {{ inArticle?: string | undefined, midContent?: string | undefined }} [options.slots]
 * @returns {() => HastPluginDefinition}
 */
export function satteriAdSlots({ client, slots = {} } = {}) {
  const { inArticle, midContent } = slots;

  // Sem credenciais configuradas (o caso do `astro dev` recém-clonado) o plugin
  // vira no-op. Melhor nenhum bloco do que caixas vazias no meio do texto.
  // A checagem fica aqui fora para que o `client` chegue estreitado a `string`
  // dentro do visitor.
  const adClient = client && (inArticle || midContent) ? client : undefined;

  // Fábrica: o Sätteri a chama uma vez por documento, então o `done` abaixo
  // reinicia a cada post em vez de vazar estado entre arquivos do build.
  return () => {
    let done = false;

    return defineHastPlugin({
      name: 'astro-ad-slots',
      element: {
        filter: ['p'],
        visit(node, ctx) {
          if (!adClient || done) return;

          const parent = ctx.parent(node);
          // Só parágrafos de primeiro nível: nunca dentro de blockquote,
          // lista ou tabela.
          if (!parent || parent.type !== 'root') return;

          // Toda a mutação acontece numa passada só, a partir do primeiro
          // parágrafo encontrado. Assim os alvos vêm direto da árvore e não
          // dependem de índices que as próprias inserções deslocariam.
          done = true;

          const paragraphs = parent.children.filter(
            /** @returns {child is Element} */
            (child) => child.type === 'element' && child.tagName === 'p',
          );

          const first = paragraphs[1];
          if (!first || paragraphs.length < MIN_PARAGRAPHS_IN_ARTICLE) return;

          /** @type {Array<[Element, string, string]>} */
          const insertions = [];

          if (inArticle) {
            insertions.push([first, inArticle, 'in-article']);
          }

          if (midContent && paragraphs.length >= MIN_PARAGRAPHS_MID_CONTENT) {
            const middle = paragraphs[Math.floor(paragraphs.length / 2)];
            // Guarda contra o ponto médio cair no mesmo parágrafo do primeiro
            // bloco, o que colaria dois anúncios um no outro.
            if (middle && middle !== first) {
              insertions.push([middle, midContent, 'mid-content']);
            }
          }

          for (const [anchor, slot, position] of insertions) {
            ctx.insertAfter(anchor, createAdNode(adClient, slot, position));
          }
        },
      },
    });
  };
}
