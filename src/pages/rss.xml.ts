import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';

import { SITE } from '~/config/site';
import { getCategory } from '~/config/categories';
import { getPosts } from '~/lib/posts';
import { absoluteUrl } from '~/lib/format';

/**
 * Feed RSS.
 *
 * Entrega o resumo, e não o texto completo, de propósito: um feed com o artigo
 * inteiro é raspado e republicado com facilidade, e o Google passa a ver
 * conteúdo duplicado apontando para outro domínio. O leitor recebe o suficiente
 * para decidir se clica.
 */
export const GET: APIRoute = async () => {
  const posts = await getPosts();

  return rss({
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    site: SITE.url,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: post.href,
      pubDate: post.data.pubDate,
      categories: [getCategory(post.data.category).name, ...post.data.tags],
      author: post.data.author ?? SITE.author.name,
    })),
    customData: [
      `<language>${SITE.lang}</language>`,
      `<copyright>© ${new Date().getFullYear()} ${SITE.name}</copyright>`,
      `<image><url>${absoluteUrl('/logo.png')}</url><title>${SITE.name}</title><link>${SITE.url}</link></image>`,
    ].join(''),
    stylesheet: '/rss.xsl',
  });
};
