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

/** Empacota os nós no envelope `@graph` final. */
export function buildGraph(...nodes: JsonLdNode[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [organizationNode(), websiteNode(), ...nodes],
  });
}
