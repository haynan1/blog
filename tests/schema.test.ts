import { describe, expect, it } from 'vitest';

import { breadcrumbNode, buildGraph, articleNode } from '~/lib/schema';
import type { Post } from '~/lib/posts';

/**
 * O JSON-LD é injetado com `set:html` dentro de um `<script>`. Isso o torna o
 * único ponto do site em que dados viram HTML sem passar pelo escape do Astro
 * — ou seja, o único sumidouro de injeção que existe aqui.
 *
 * Estes testes existem porque essa injeção JÁ aconteceu: `JSON.stringify` cru
 * permitia que um título com `</script>` fechasse a tag e o resto virasse
 * marcação viva. Se alguém remover o escape, é aqui que o build para.
 */

function makePost(overrides: Partial<Post['data']> = {}): Post {
  return {
    id: 'post-de-teste',
    body: 'Corpo do post.',
    href: '/blog/post-de-teste',
    readingTime: { minutes: 4, words: 800, label: '4 min de leitura' },
    data: {
      title: 'Um título perfeitamente normal',
      description: 'Uma descrição perfeitamente normal, com tamanho suficiente para o schema.',
      pubDate: new Date('2026-03-12T12:00:00Z'),
      category: 'tecnologia',
      tags: ['uma-tag'],
      image: { src: '/_astro/capa.webp', width: 1600, height: 900, format: 'webp' },
      imageAlt: 'Descrição da capa',
      draft: false,
      featured: false,
      ...overrides,
    },
  } as unknown as Post;
}

/** Extrai o JSON como o navegador o veria: até o primeiro `</script`. */
function readAsBrowserWould(serialized: string): string {
  const html = `<script type="application/ld+json">${serialized}</script>`;
  const start = html.indexOf('>') + 1;
  const end = html.indexOf('</script', start);
  return html.slice(start, end);
}

describe('buildGraph — escape para o contexto <script>', () => {
  it('não deixa `</script>` intacto na saída', () => {
    const hostil = 'Titulo </script><img src=x onerror=alert(1)> fim';
    const serialized = buildGraph(articleNode(makePost({ title: hostil }), '/capa.jpg'));

    expect(serialized).not.toContain('</script');
    expect(serialized).not.toContain('<img');
  });

  it('mantém o JSON íntegro quando lido até o fim da tag', () => {
    const hostil = 'Titulo </script><img src=x onerror=alert(1)> fim';
    const serialized = buildGraph(articleNode(makePost({ title: hostil }), '/capa.jpg'));

    // Se o escape falhasse, o navegador cortaria o JSON no meio e isto lançaria.
    const visto = readAsBrowserWould(serialized);
    expect(() => JSON.parse(visto)).not.toThrow();
  });

  it('preserva o valor original para quem consome o JSON', () => {
    // O escape não pode "consertar" o dado: o Google precisa ler o título como
    // o autor escreveu. `<` é JSON válido e desenha o mesmo caractere.
    const hostil = 'Preço < 10 & frete > 0';
    const serialized = buildGraph(articleNode(makePost({ title: hostil }), '/capa.jpg'));

    const grafo = JSON.parse(serialized);
    const artigo = grafo['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BlogPosting',
    );
    expect(artigo.headline).toBe(hostil);
  });

  it('escapa os separadores de linha U+2028/U+2029', () => {
    const serialized = buildGraph(
      articleNode(makePost({ title: `Titulo com separadores` }), '/capa.jpg'),
    );

    expect(serialized).not.toContain(' ');
    expect(serialized).not.toContain(' ');
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('não corrompe acentuação do português', () => {
    const titulo = 'Negócios, produtividade e ação — três acentos';
    const serialized = buildGraph(articleNode(makePost({ title: titulo }), '/capa.jpg'));

    const grafo = JSON.parse(serialized);
    const artigo = grafo['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BlogPosting',
    );
    expect(artigo.headline).toBe(titulo);
  });

  it('escapa também nomes vindos do breadcrumb', () => {
    const serialized = buildGraph(breadcrumbNode([{ name: '</script><b>x</b>', href: '/blog' }]));

    expect(serialized).not.toContain('</script');
    expect(() => JSON.parse(serialized)).not.toThrow();
  });
});

describe('buildGraph — estrutura do grafo', () => {
  it('sempre inclui Organization e WebSite', () => {
    const grafo = JSON.parse(buildGraph());
    const tipos = grafo['@graph'].map((n: Record<string, unknown>) => n['@type']);

    expect(tipos).toContain('Organization');
    expect(tipos).toContain('WebSite');
    expect(grafo['@context']).toBe('https://schema.org');
  });

  it('referencia a Organization por @id em vez de repetir o bloco', () => {
    const grafo = JSON.parse(buildGraph(articleNode(makePost(), '/capa.jpg')));
    const artigo = grafo['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BlogPosting',
    );
    const org = grafo['@graph'].find((n: Record<string, unknown>) => n['@type'] === 'Organization');

    expect(artigo.publisher['@id']).toBe(org['@id']);
    // Duas definições divergentes da mesma entidade é o erro que o @graph evita.
    expect(artigo.publisher.name).toBeUndefined();
  });

  it('numera o breadcrumb a partir de 1 e em ordem', () => {
    const grafo = JSON.parse(
      buildGraph(
        breadcrumbNode([
          { name: 'Início', href: '/' },
          { name: 'Blog', href: '/blog' },
          { name: 'Post', href: '/blog/post' },
        ]),
      ),
    );
    const trilha = grafo['@graph'].find(
      (n: Record<string, unknown>) => n['@type'] === 'BreadcrumbList',
    );

    expect(trilha.itemListElement.map((i: { position: number }) => i.position)).toEqual([1, 2, 3]);
    expect(trilha.itemListElement[0].item).toMatch(/^https:\/\//);
  });
});
