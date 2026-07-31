/**
 * Fonte única de verdade da identidade do site.
 *
 * Este arquivo é importado tanto pelo `astro.config.mjs` (para `site`, sitemap
 * e canonical) quanto pelo runtime das páginas. Alterar a marca, o domínio ou
 * os links sociais é uma edição em um único lugar.
 *
 * `url` NÃO é segredo — é informação pública impressa em toda tag canonical.
 * Por isso mora aqui, versionado, e não em variável de ambiente: um canonical
 * errado é um bug de SEO silencioso, e queremos que ele apareça no code review.
 */

export const SITE = {
  /** Domínio canônico, sem barra final. Trocar ao apontar o domínio real. */
  url: 'https://www.contracorrente.com.br',

  name: 'Contracorrente',
  /** Usado em `<title>` como sufixo: "Título do post — Contracorrente" */
  titleSeparator: '—',
  tagline: 'Ideias que remam contra a maré',
  description:
    'Ensaios e guias sobre tecnologia, negócios e produtividade para quem prefere pensar por conta própria a repetir o consenso.',

  lang: 'pt-BR',
  locale: 'pt_BR',
  /** IANA timezone — usado para formatar datas de forma estável no build. */
  timeZone: 'America/Sao_Paulo',

  /** Autor/editor padrão. Vira `Organization` e `Person` no JSON-LD. */
  author: {
    name: 'Contracorrente',
    email: 'contato@contracorrente.com.br',
    url: 'https://www.contracorrente.com.br/sobre',
  },

  /** Imagem de fallback para Open Graph / Twitter. Mora em `public/`. */
  defaultImage: '/og-default.png',

  /** Perfis públicos. Entram no `sameAs` do JSON-LD e no rodapé. */
  social: [
    { name: 'X', url: 'https://x.com/contracorrente', handle: '@contracorrente' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/contracorrente' },
    { name: 'YouTube', url: 'https://www.youtube.com/@contracorrente' },
  ],

  /** Posts por página em /blog e nos arquivos de categoria. */
  postsPerPage: 12,

  /** Palavras por minuto para o cálculo de tempo de leitura (média pt-BR). */
  wordsPerMinute: 200,
} as const;

export type SiteConfig = typeof SITE;

/** Navegação principal do header. */
export const NAV_LINKS = [
  { label: 'Blog', href: '/blog' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
] as const;

/** Links institucionais do rodapé (exigidos pela política do AdSense). */
export const LEGAL_LINKS = [
  { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
  { label: 'Termos de Uso', href: '/termos-de-uso' },
] as const;
