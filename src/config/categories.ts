/**
 * Taxonomia fechada de categorias.
 *
 * É uma lista explícita, e não uma string livre no frontmatter, porque o schema
 * da collection valida contra ela: um typo em `categoria` quebra o build em vez
 * de gerar silenciosamente uma página de arquivo órfã e um link 404 no menu.
 *
 * Para adicionar uma categoria: inclua a entrada aqui e o resto (rota de
 * arquivo, sitemap, RSS, breadcrumb, rodapé) passa a existir sozinho.
 */

export const CATEGORIES = [
  {
    slug: 'tecnologia',
    name: 'Tecnologia',
    description:
      'O que muda de fato no software, no hardware e nas ferramentas que usamos todo dia — sem o hype do ciclo de notícias.',
  },
  {
    slug: 'negocios',
    name: 'Negócios',
    description:
      'Como empresas ganham dinheiro, como perdem, e o que dá para aprender com as duas coisas.',
  },
  {
    slug: 'produtividade',
    name: 'Produtividade',
    description:
      'Sistemas de trabalho que sobrevivem ao contato com a realidade, não os que rendem bem numa thread.',
  },
  {
    slug: 'design',
    name: 'Design',
    description:
      'Decisões visuais e de produto examinadas de perto: o que faz uma interface funcionar e por quê.',
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];
export type Category = (typeof CATEGORIES)[number];

/** Tupla exigida pelo `z.enum()` do schema da collection. */
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as unknown as [
  CategorySlug,
  ...CategorySlug[],
];

const BY_SLUG = new Map<string, Category>(CATEGORIES.map((c) => [c.slug, c]));

/**
 * Resolve o slug para a categoria. Lança em vez de retornar `undefined`:
 * o build inteiro roda com dados já validados pelo schema, então um slug
 * desconhecido aqui é bug de código, não entrada de usuário.
 */
export function getCategory(slug: string): Category {
  const category = BY_SLUG.get(slug);
  if (!category) {
    throw new Error(
      `Categoria desconhecida: "${slug}". Slugs válidos: ${CATEGORIES.map((c) => c.slug).join(', ')}`,
    );
  }
  return category;
}
