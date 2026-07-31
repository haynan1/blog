import { SITE } from '~/config/site';
import { absoluteUrl, toISO } from './format';
import type { Post } from './posts';

/**
 * Construtores de JSON-LD.
 *
 * Tudo é montado como um único grafo (`@graph`) com `@id` estável por entidade.
 * É o formato que o Google prefere: a `Organization` é declarada uma vez e
 * referenciada por `@id` pelo `WebSite` e por cada `Article`, em vez de repetir
 * o bloco inteiro em toda página e arriscar versões divergentes.
 */

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

type JsonLdNode = Record<string, unknown>;

export function organizationNode(): JsonLdNode {
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/logo.png'),
      width: 512,
      height: 512,
    },
    sameAs: SITE.social.map((profile) => profile.url),
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    inLanguage: SITE.lang,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbNode(crumbs: Crumb[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}

export function articleNode(post: Post, imageUrl: string): JsonLdNode {
  return {
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(post.href)}#article`,
    headline: post.data.title,
    description: post.data.description,
    inLanguage: SITE.lang,
    datePublished: toISO(post.data.pubDate),
    dateModified: toISO(post.data.updatedDate ?? post.data.pubDate),
    // `wordCount` e `timeRequired` são sinais legítimos de profundidade — o
    // tipo de coisa que a revisão manual do AdSense pesa.
    wordCount: post.readingTime.words,
    timeRequired: `PT${post.readingTime.minutes}M`,
    keywords: post.data.tags.join(', '),
    articleSection: post.data.category,
    image: { '@type': 'ImageObject', url: absoluteUrl(imageUrl) },
    author: {
      '@type': 'Person',
      name: post.data.author ?? SITE.author.name,
      url: SITE.author.url,
    },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(post.href) },
  };
}

export function collectionPageNode(name: string, description: string, href: string): JsonLdNode {
  return {
    '@type': 'CollectionPage',
    '@id': `${absoluteUrl(href)}#collection`,
    name,
    description,
    url: absoluteUrl(href),
    inLanguage: SITE.lang,
    isPartOf: { '@id': WEBSITE_ID },
  };
}

/**
 * Escapa os caracteres que quebrariam o bloco `<script>` que hospeda o JSON-LD.
 *
 * `JSON.stringify` produz JSON válido, mas não sabe que o resultado vai ser
 * embutido em HTML. O parser do navegador encerra um elemento `<script>` no
 * primeiro `</script`, esteja ele dentro de uma string JSON ou não — então um
 * título de post contendo `</script>` fecharia a tag e o que viesse depois
 * seria interpretado como marcação viva.
 *
 * Hoje o conteúdo vem de arquivos Markdown escritos pelo dono do site, então
 * não há caminho de entrada não confiável. Isso muda no dia em que entrar um
 * post de autor convidado — o schema já prevê o campo `author` — ou um texto
 * colado de fora. E, mesmo sem malícia, um `<` legítimo num título corromperia
 * o structured data em silêncio, derrubando o rich result sem erro nenhum.
 *
 * `<` é JSON válido e desenha o mesmo caractere: o Google lê igual, o
 * parser de HTML não vê mais uma tag.
 */
function escapeForScriptTag(json: string): string {
  return (
    json
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      // U+2028/U+2029 sao quebras de linha validas em JSON e ilegais em
      // JavaScript. Escapa-las mantem o bloco parseavel se algum dia ele
      // for lido por um `JSON.parse` embutido.
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  );
}

/** Empacota os nós no envelope `@graph` final, pronto para ir num `<script>`. */
export function buildGraph(...nodes: JsonLdNode[]): string {
  return escapeForScriptTag(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [organizationNode(), websiteNode(), ...nodes],
    }),
  );
}
