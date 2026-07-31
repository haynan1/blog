import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * O pipeline de publicação é código que roda uma vez por artigo, com a senha do
 * servidor na mão, e sem ninguém olhando. Quando ele quebra, quebra em
 * produção.
 *
 * Estes testes travam as invariantes que falhariam em silêncio — a classe de
 * erro em que tudo continua "passando" e o resultado é que o site sobe errado.
 */

const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
const envExample = readFileSync('.env.example', 'utf8');
const adminHtaccess = readFileSync('public/admin/.htaccess', 'utf8');
const rootHtaccess = readFileSync('public/.htaccess', 'utf8');

describe('variáveis de ambiente do build', () => {
  const noEnvExample = [...envExample.matchAll(/^(PUBLIC_[A-Z_]+)=/gm)].map((m) => m[1]).sort();
  const noWorkflow = [
    ...new Set([...workflow.matchAll(/vars\.(PUBLIC_[A-Z_]+)/g)].map((m) => m[1])),
  ].sort();

  it('toda variável documentada é passada para o build de produção', () => {
    // Esquecer de passar no CI faz o build de produção sair sem o valor, sem
    // erro nenhum: os anúncios simplesmente não aparecem no site publicado.
    expect(noWorkflow).toEqual(noEnvExample);
  });

  it('nenhuma variável PUBLIC_ é tratada como secret', () => {
    // Um `PUBLIC_` vai embutido no HTML. Guardá-lo como secret dá uma falsa
    // sensação de proteção e ainda mascara o valor nos logs, atrapalhando o
    // diagnóstico sem proteger nada.
    expect(workflow).not.toMatch(/secrets\.PUBLIC_/);
  });

  it('as credenciais de FTP são secrets, nunca variables', () => {
    for (const nome of ['FTP_SERVER', 'FTP_USERNAME', 'FTP_PASSWORD']) {
      expect(workflow).toContain(`secrets.${nome}`);
      expect(workflow).not.toContain(`vars.${nome}`);
    }
  });
});

describe('ordem e segurança do workflow', () => {
  it('verifica antes de enviar — nunca publica build não verificado', () => {
    const verify = workflow.indexOf('npm run verify');
    const ftp = workflow.indexOf('FTP-Deploy-Action');
    expect(verify).toBeGreaterThan(-1);
    expect(ftp).toBeGreaterThan(-1);
    expect(verify).toBeLessThan(ftp);
  });

  it('confere o build gerado antes de enviar', () => {
    const conferencia = workflow.indexOf('dist/index.html');
    const ftp = workflow.indexOf('FTP-Deploy-Action');
    expect(conferencia).toBeLessThan(ftp);
  });

  it('ação de terceiro está fixada em commit, não em tag', () => {
    // Tag é ponteiro móvel. Esta ação recebe a senha do FTP: se a tag for
    // repontada para código malicioso, a credencial vaza no próximo deploy.
    const terceiros = [...workflow.matchAll(/uses: (?!actions\/)([^\s]+)/g)].map((m) => m[1]);
    expect(terceiros.length).toBeGreaterThan(0);
    for (const acao of terceiros) {
      expect(acao, `${acao} deveria estar fixada em SHA de 40 caracteres`).toMatch(
        /@[0-9a-f]{40}$/,
      );
    }
  });

  it('não usa pull_request_target', () => {
    // Esse gatilho roda com os secrets do repositório em código vindo de fora.
    expect(workflow).not.toContain('pull_request_target');
  });

  it('pede o mínimo de permissão', () => {
    expect(workflow).toMatch(/permissions:\s*\n\s*contents: read/);
  });

  it('transfere por FTP sobre TLS', () => {
    expect(workflow).toContain('protocol: ftps');
  });

  it('impede dois deploys simultâneos', () => {
    // Dois envios concorrentes no mesmo FTP deixariam o servidor num estado
    // misturado, com arquivos de dois builds diferentes.
    expect(workflow).toContain('concurrency:');
    expect(workflow).toContain('cancel-in-progress: false');
  });

  it('instala com npm ci, não npm install', () => {
    expect(workflow).toContain('npm ci');
    expect(workflow).not.toMatch(/run: npm install/);
  });
});

describe('regras de Apache do painel', () => {
  it('a política da raiz nega .yml', () => {
    // Premissa do teste seguinte. Se isto mudar, o override vira código morto.
    expect(rootHtaccess).toMatch(/FilesMatch[^\n]*yml/);
  });

  it('o painel reabre o próprio config.yml', () => {
    // Sem isto o painel abre numa tela de erro: ele busca o config por HTTP e
    // levaria 403 da regra da raiz.
    expect(adminHtaccess).toMatch(/<Files "config\.yml">[\s\S]*?Require all granted/);
  });

  it('o painel desliga o cache imutável herdado', () => {
    // A raiz marca todo .js como immutable por um ano — correto para os
    // arquivos com hash em _astro/. O bundle do painel não tem hash: com
    // aquela regra, uma atualização nunca chegaria ao navegador.
    expect(adminHtaccess).toContain('no-cache, must-revalidate');
  });

  it('a CSP do painel libera a API do GitHub e não os domínios de anúncio', () => {
    expect(adminHtaccess).toContain('https://api.github.com');
    expect(adminHtaccess).not.toContain('googlesyndication');
  });

  it('o painel não pode ser embutido em iframe', () => {
    // Defesa contra clickjacking na superfície que tem o token.
    expect(adminHtaccess).toContain("frame-ancestors 'none'");
  });
});
