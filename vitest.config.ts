/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

/**
 * `getViteConfig` reaproveita o Vite do próprio Astro. É o que faz os módulos
 * virtuais (`astro:content`) e o alias `~/` resolverem dentro dos testes sem
 * precisar duplicar configuração — o teste roda contra a mesma resolução que o
 * build de produção usa.
 */
export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Um build inteiro leva ~2,5s; um teste que passe de 10s está travado,
    // não lento.
    testTimeout: 10_000,
  },
});
