import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { CATEGORY_SLUGS } from './config/categories';

/**
 * Schema dos posts.
 *
 * O schema é deliberadamente rígido. Um frontmatter incompleto derruba o build
 * local — que é exatamente onde o erro custa segundos. O mesmo erro descoberto
 * depois do upload por FTP custa uma página quebrada em produção sem ninguém
 * olhando.
 */
const blog = defineCollection({
  loader: glob({
    base: './src/content/blog',
    pattern: '**/*.{md,mdx}',
  }),
  schema: ({ image }) =>
    z
      .object({
        /** Manchete. Vira <h1>, <title> e headline do JSON-LD. */
        title: z.string().min(10).max(110),

        /**
         * Meta description e resumo nos cards. O limite alto é o ponto em que
         * o Google trunca o snippet na SERP.
         */
        description: z.string().min(70).max(180),

        pubDate: z.coerce.date(),

        /** Só preencher em edições relevantes: alimenta `dateModified`. */
        updatedDate: z.coerce.date().optional(),

        category: z.enum(CATEGORY_SLUGS),

        tags: z.array(z.string().min(2)).min(1).max(8).default([]),

        /**
         * `image()` valida que o arquivo existe e captura as dimensões em
         * tempo de build — é o que permite emitir width/height no HTML e
         * manter CLS zerado.
         */
        image: image(),
        imageAlt: z.string().min(5),
        /** Crédito da imagem. Obrigatório em foto de terceiro. */
        imageCredit: z.string().optional(),

        /** Rascunhos ficam fora do build de produção. */
        draft: z.boolean().default(false),

        /** No máximo um post em destaque manda no hero da home. */
        featured: z.boolean().default(false),

        /** Sobrescreve o autor padrão do site em posts convidados. */
        author: z.string().optional(),

        /** Fontes citadas. Renderizadas ao final do post e usadas como sinal
         *  de originalidade na revisão manual do AdSense. */
        sources: z
          .array(
            z.object({
              label: z.string(),
              url: z.url(),
            }),
          )
          .optional(),
      })
      .strict(),
});

export const collections = { blog };
