/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',

  // `prettier-plugin-tailwindcss` precisa ser o ÚLTIMO da lista: ele envolve
  // os outros para ordenar as classes depois que eles já formataram.
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],

  overrides: [
    {
      files: '*.astro',
      options: { parser: 'astro' },
    },
    {
      // Markdown de post: quebrar linha automaticamente atrapalha o diff de
      // texto editorial, onde a unidade de revisão é o parágrafo.
      files: '*.md',
      options: { proseWrap: 'preserve' },
    },
  ],
};
