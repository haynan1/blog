// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { satteri } from '@astrojs/markdown-satteri';
import { loadEnv } from 'vite';

import { SITE } from './src/config/site.ts';
import { satteriAdSlots } from './src/plugins/satteri-ad-slots.mjs';

// `import.meta.env` não existe durante o carregamento do config, e variáveis do
// `.env` não chegam sozinhas em `process.env`. `loadEnv` é a forma suportada de
// ler `.env` na etapa de configuração — filtrada pelo prefixo PUBLIC_.
const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');

export default defineConfig({
  site: SITE.url,

  // Apache serve `/blog/post/index.html` para `/blog/post` e para `/blog/post/`.
  // Fixamos `never` para que canonical, sitemap e links internos concordem em
  // uma única forma — o .htaccess redireciona a outra com 301.
  trailingSlash: 'never',

  output: 'static',

  build: {
    // Gera `sobre/index.html` em vez de `sobre.html`: URLs limpas sem depender
    // de MultiViews/mod_rewrite do Apache para esconder a extensão.
    format: 'directory',
    // Um único arquivo CSS enxuto vence o custo de várias requisições em
    // hospedagem compartilhada, onde o RTT domina.
    inlineStylesheets: 'auto',
  },

  markdown: {
    processor: satteri({
      hastPlugins: [
        // Injeta os blocos de anúncio no HTML em tempo de build: o `<ins>` já
        // chega no HTML com altura reservada, então o AdSense preenche uma
        // caixa que já existe. Inserir via JS depois do paint custaria CLS.
        satteriAdSlots({
          client: env.PUBLIC_ADSENSE_CLIENT,
          slots: {
            inArticle: env.PUBLIC_ADSENSE_SLOT_IN_ARTICLE,
            midContent: env.PUBLIC_ADSENSE_SLOT_MID_CONTENT,
          },
        }),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: true,
    },
  },

  // Baixa, subseta e hospeda as fontes no próprio domínio durante o build, e
  // gera fallbacks com métricas ajustadas (size-adjust/ascent-override) para
  // que a troca da fonte não empurre o layout. Zero requisição a terceiros:
  // bom para CLS e para a LGPD (nenhum IP vaza para o Google Fonts).
  fonts: [
    {
      name: 'Fraunces',
      cssVariable: '--ff-display',
      provider: fontProviders.fontsource(),
      weights: ['400 900'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Iowan Old Style', 'Georgia', 'serif'],
    },
    {
      name: 'Newsreader',
      cssVariable: '--ff-prose',
      provider: fontProviders.fontsource(),
      weights: ['300 700'],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Charter', 'Georgia', 'serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--ff-ui',
      provider: fontProviders.fontsource(),
      weights: ['400 700'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['Segoe UI', 'Helvetica Neue', 'sans-serif'],
    },
  ],

  integrations: [
    mdx(),
    sitemap({
      // Rascunhos e páginas legais não precisam competir por crawl budget.
      filter: (page) =>
        !page.includes('/politica-de-privacidade') && !page.includes('/termos-de-uso'),
      serialize(item) {
        if (item.url === `${SITE.url}/`) {
          item.changefreq = ChangeFreqEnum.DAILY;
          item.priority = 1.0;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],

  image: {
    // `sharp` roda só no build local; nada disso vai para a Hostgator.
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Apache com mod_deflate comprime bem; alvo moderno reduz o bundle.
      target: 'es2022',
    },
  },
});
