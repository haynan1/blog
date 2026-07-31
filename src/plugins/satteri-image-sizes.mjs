import { defineHastPlugin } from 'satteri';

/**
 * Ajusta o atributo `sizes` das imagens escritas no Markdown.
 *
 * Com `image.layout: 'constrained'` no astro.config, o Astro gera um `srcset`
 * completo para `![alt](caminho)` — mas o `sizes` que ele calcula sozinho é
 * genérico (`100vw`), porque ele não tem como saber a largura da coluna de
 * texto.
 *
 * Na prática o corpo do artigo nunca passa de 43rem (688px). Sem esta
 * correção, um desktop de 1920px baixaria a variante de 1600w para preencher
 * uma caixa de 688px — cerca de 3x mais bytes do que o necessário, em cada
 * imagem de cada artigo.
 *
 * O `sizes` é escrito ainda no estágio hast, antes de o Astro otimizar as
 * imagens: ali o `<img>` só tem `src` e `alt`. O pipeline de imagens preserva
 * o valor do autor e só preenche o atributo quando ele está ausente, então o
 * que sai no HTML final é o definido aqui.
 *
 * Os breakpoints espelham o layout de `src/pages/blog/[slug].astro`: abaixo de
 * 1100px o texto ocupa a largura útil da página; acima, a coluna trava em
 * 43rem porque o sumário passa a dividir o espaço.
 *
 * @import { HastPluginDefinition } from 'satteri'
 */

/** Precisa acompanhar `--container-editorial` e o breakpoint de `.post__layout`. */
const PROSE_SIZES = '(min-width: 1100px) 688px, 100vw';

/**
 * @returns {() => HastPluginDefinition}
 */
export function satteriImageSizes() {
  return () =>
    defineHastPlugin({
      name: 'astro-image-sizes',
      element: {
        filter: ['img'],
        visit(node, ctx) {
          const props = node.properties ?? {};
          const src = props['src'];

          // Imagem remota não passa pelo otimizador e não ganha `srcset`;
          // definir `sizes` nela seria uma dica sem nada para escolher.
          if (typeof src !== 'string' || /^(https?:)?\/\//.test(src)) return;

          // Um `sizes` escrito à mão em HTML dentro do Markdown vence: quem
          // desceu a esse nível tinha um motivo.
          if (props['sizes']) return;

          ctx.setProperty(node, 'sizes', PROSE_SIZES);
        },
      },
    });
}
