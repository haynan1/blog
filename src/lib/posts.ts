import { getCollection, type CollectionEntry } from 'astro:content';

import { CATEGORIES, type CategorySlug } from '~/config/categories';
import { getReadingTime, type ReadingTime } from './reading-time';

export type BlogEntry = CollectionEntry<'blog'>;

/** Post pronto para renderizar: entry + tudo que é derivado dela. */
export interface Post extends BlogEntry {
  readingTime: ReadingTime;
  href: string;
}

function toPost(entry: BlogEntry): Post {
  return {
    ...entry,
    readingTime: getReadingTime(entry.body ?? ''),
    href: `/blog/${entry.id}`,
  };
}

function byDateDesc(a: Post, b: Post): number {
  return b.data.pubDate.getTime() - a.data.pubDate.getTime();
}

/**
 * Todos os posts publicados, do mais recente para o mais antigo.
 *
 * Rascunhos são cortados apenas no build de produção: em `astro dev` eles
 * aparecem, que é o ponto de escrever um rascunho.
 */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft === false : true;
  });

  return entries.map(toPost).sort(byDateDesc);
}

export async function getPostsByCategory(category: CategorySlug): Promise<Post[]> {
  const posts = await getPosts();
  return posts.filter((post) => post.data.category === category);
}

/**
 * Post do hero da home: o marcado como `featured` ou, na ausência dele, o mais
 * recente. Se houver mais de um `featured`, vence o mais recente — sem estado
 * escondido nem ordem de arquivo definindo layout.
 */
export async function getFeaturedPost(posts: Post[]): Promise<Post | undefined> {
  return posts.find((post) => post.data.featured) ?? posts[0];
}

/** Categorias que têm ao menos um post publicado, com a contagem. */
export async function getCategoriesWithCount(
  posts: Post[],
): Promise<Array<{ slug: CategorySlug; name: string; description: string; count: number }>> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.data.category, (counts.get(post.data.category) ?? 0) + 1);
  }

  return CATEGORIES.filter((category) => counts.has(category.slug)).map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    count: counts.get(category.slug) ?? 0,
  }));
}

/**
 * Posts relacionados, por relevância decrescente.
 *
 * Pontuação: tags em comum valem 3, mesma categoria vale 2, e o desempate é
 * pela data. Simples de propósito — um TF-IDF aqui seria peso morto num
 * catálogo de dezenas de artigos, e o resultado não ficaria melhor.
 */
export function getRelatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const currentTags = new Set(current.data.tags);

  return all
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sharedTags = post.data.tags.filter((tag) => currentTags.has(tag)).length;
      const sameCategory = post.data.category === current.data.category ? 1 : 0;
      return { post, score: sharedTags * 3 + sameCategory * 2 };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byDateDesc(a.post, b.post))
    .slice(0, limit)
    .map(({ post }) => post);
}

export interface Paginated<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  prevUrl: string | undefined;
  nextUrl: string | undefined;
}

/**
 * Fatia uma lista para uma página específica.
 *
 * `buildHref(1)` deve devolver a URL da primeira página sem sufixo (`/blog`),
 * para que a página 1 tenha uma única URL canônica e não duplique conteúdo com
 * `/blog/pagina/1`.
 */
export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
  buildHref: (page: number) => string,
): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const start = (page - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    page,
    totalPages,
    total: items.length,
    prevUrl: page > 1 ? buildHref(page - 1) : undefined,
    nextUrl: page < totalPages ? buildHref(page + 1) : undefined,
  };
}

/** Números de página 2..N, para gerar as rotas de paginação. */
export function pageNumbersAfterFirst(total: number, perPage: number): number[] {
  const totalPages = Math.ceil(total / perPage);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2);
}
