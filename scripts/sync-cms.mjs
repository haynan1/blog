/**
 * Copia o bundle do Sveltia CMS de `node_modules` para `public/admin/`.
 *
 * Por que auto-hospedar em vez de carregar do CDN:
 *
 *  1. A Content Security Policy do site permite scripts só de `'self'`. Puxar
 *     2,3 MB de um CDN de terceiro exigiria abrir a política — e abrir CSP para
 *     ganhar conveniência é exatamente o tipo de troca que este projeto evita.
 *  2. A versão fica travada no `package-lock.json`. Um CDN com tag `@latest`
 *     pode mudar o painel embaixo de você, sem aviso e sem rollback.
 *  3. O painel continua funcionando se o CDN cair.
 *
 * O arquivo copiado é artefato de build: está no `.gitignore` e é regenerado
 * a cada `npm run dev` / `npm run build`.
 */

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

const DESTINO = 'public/admin';
const ARQUIVO = 'sveltia-cms.js';

try {
  // O pacote não expõe o `package.json` no campo `exports`, então resolver por
  // ele falha. Resolvendo o entry point e subindo um nível chega-se ao `dist/`
  // sem depender do layout que o npm escolheu para node_modules.
  const dist = dirname(require.resolve('@sveltia/cms'));
  const origem = join(dist, ARQUIVO);

  mkdirSync(DESTINO, { recursive: true });
  copyFileSync(origem, join(DESTINO, ARQUIVO));

  const kb = Math.round(statSync(join(DESTINO, ARQUIVO)).size / 1024);
  const { version } = JSON.parse(readFileSync(join(dist, '..', 'package.json'), 'utf8'));
  console.log(`  painel: Sveltia CMS ${version} copiado para ${DESTINO}/ (${kb} KB)`);
} catch (erro) {
  // Não derruba o build: um site sem painel ainda é um site que funciona.
  // Derrubar aqui impediria de publicar por causa de uma ferramenta de autoria.
  console.warn(
    `  aviso: não foi possível preparar o painel do CMS (${erro instanceof Error ? erro.message : erro}).`,
  );
  console.warn('  O site será gerado normalmente, mas /admin não vai funcionar.');
}
