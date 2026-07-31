import { describe, expect, it } from 'vitest';

import { getRelatedPosts, pageNumbersAfterFirst, paginate, type Post } from '~/lib/posts';

/**
 * Paginação e posts relacionados são lógica pura, e são exatamente o tipo de
 * código que quebra em silêncio: um off-by-one gera `/blog/pagina/1` duplicando
 * a home do arquivo, ou some com a última página inteira. Nada disso derruba o
 * build — só aparece como conteúdo duplicado no Search Console semanas depois.
 */

function makePost(id: string, overrides: Partial<Post['data']> = {}): Post {
  return {
    id,
    href: `/blog/${id}`,
    body: '',
    readingTime: { minutes: 1, words: 100, label: '1 min de leitura' },
    data: {
      title: `Título do ${id}`,
      description: 'Descrição.',
      pubDate: new Date('2026-01-01T12:00:00Z'),
      category: 'tecnologia',
      tags: [],
      imageAlt: 'alt',
      draft: false,
      featured: false,
      ...overrides,
    },
  } as unknown as Post;
}

const href = (page: number) => (page === 1 ? '/blog' : `/blog/pagina/${page}`);

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it('fatia a página 1 corretamente', () => {
    const r = paginate(items, 1, 12, href);
    expect(r.items).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(r.totalPages).toBe(3);
    expect(r.total).toBe(25);
  });

  it('a página 1 nunca aponta para trás', () => {
    expect(paginate(items, 1, 12, href).prevUrl).toBeUndefined();
  });

  it('a última página nunca aponta para frente', () => {
    expect(paginate(items, 3, 12, href).nextUrl).toBeUndefined();
  });

  it('o link "anterior" da página 2 é a raiz, não /pagina/1', () => {
    // Se isto quebrar, existem duas URLs servindo o mesmo conteúdo.
    expect(paginate(items, 2, 12, href).prevUrl).toBe('/blog');
  });

  it('a última página leva só o resto', () => {
    expect(paginate(items, 3, 12, href).items).toEqual([25]);
  });

  it('lista vazia devolve uma página, não zero', () => {
    // `totalPages: 0` faria a barra de paginação renderizar "página 1 de 0".
    const r = paginate([], 1, 12, href);
    expect(r.totalPages).toBe(1);
    expect(r.items).toEqual([]);
    expect(r.nextUrl).toBeUndefined();
  });

  it('quantidade exata de um múltiplo não cria página vazia', () => {
    const r = paginate(
      Array.from({ length: 24 }, (_, i) => i),
      2,
      12,
      href,
    );
    expect(r.totalPages).toBe(2);
    expect(r.items).toHaveLength(12);
    expect(r.nextUrl).toBeUndefined();
  });
});

describe('pageNumbersAfterFirst', () => {
  it('não gera rota quando tudo cabe em uma página', () => {
    expect(pageNumbersAfterFirst(12, 12)).toEqual([]);
    expect(pageNumbersAfterFirst(5, 12)).toEqual([]);
  });

  it('nunca inclui a página 1', () => {
    // `/blog/pagina/1` seria conteúdo duplicado de `/blog`.
    expect(pageNumbersAfterFirst(100, 12)).not.toContain(1);
  });

  it('gera exatamente as páginas 2..N', () => {
    expect(pageNumbersAfterFirst(25, 12)).toEqual([2, 3]);
    expect(pageNumbersAfterFirst(13, 12)).toEqual([2]);
  });

  it('coleção vazia não gera rota nenhuma', () => {
    expect(pageNumbersAfterFirst(0, 12)).toEqual([]);
  });
});

describe('getRelatedPosts', () => {
  const atual = makePost('atual', { category: 'tecnologia', tags: ['astro', 'seo'] });

  it('nunca inclui o próprio post', () => {
    const r = getRelatedPosts(atual, [atual, makePost('outro', { tags: ['astro'] })]);
    expect(r.map((p) => p.id)).not.toContain('atual');
  });

  it('tags em comum pesam mais que a categoria', () => {
    const soTag = makePost('so-tag', { category: 'design', tags: ['astro', 'seo'] });
    const soCategoria = makePost('so-categoria', { category: 'tecnologia', tags: ['outra'] });

    const r = getRelatedPosts(atual, [soCategoria, soTag]);
    expect(r[0]?.id).toBe('so-tag');
  });

  it('exclui posts sem nenhuma relação', () => {
    const nada = makePost('nada', { category: 'design', tags: ['irrelevante'] });
    expect(getRelatedPosts(atual, [nada])).toEqual([]);
  });

  it('respeita o limite', () => {
    const muitos = Array.from({ length: 10 }, (_, i) =>
      makePost(`p${i}`, { category: 'tecnologia', tags: ['astro'] }),
    );
    expect(getRelatedPosts(atual, muitos, 3)).toHaveLength(3);
  });

  it('empate é desfeito pelo post mais recente', () => {
    const velho = makePost('velho', {
      category: 'tecnologia',
      tags: ['astro'],
      pubDate: new Date('2020-01-01'),
    });
    const novo = makePost('novo', {
      category: 'tecnologia',
      tags: ['astro'],
      pubDate: new Date('2026-06-01'),
    });

    expect(getRelatedPosts(atual, [velho, novo])[0]?.id).toBe('novo');
  });

  it('lista vazia não quebra', () => {
    expect(getRelatedPosts(atual, [])).toEqual([]);
  });
});
