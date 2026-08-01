import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { CATEGORIES } from '~/config/categories';
import { SITE } from '~/config/site';

/**
 * O painel em /admin e o schema Zod descrevem a mesma coisa em dois lugares.
 * Divergência entre eles é silenciosa e cara: o editor deixa salvar um post que
 * o build vai recusar, e você só descobre na hora de publicar — geralmente
 * depois de escrever o texto inteiro.
 *
 * Estes testes não validam YAML. Eles validam que as duas descrições continuam
 * falando do mesmo formato.
 */

const configYml = readFileSync('public/admin/config.yml', 'utf8');
const contentConfig = readFileSync('src/content.config.ts', 'utf8');

describe('painel /admin espelha o schema de conteúdo', () => {
  it('declara todos os campos do frontmatter', () => {
    const campos = [
      'title',
      'description',
      'pubDate',
      'updatedDate',
      'category',
      'tags',
      'image',
      'imageAlt',
      'imageCredit',
      'draft',
      'featured',
      'author',
      'sources',
    ];

    const ausentes = campos.filter((c) => !new RegExp(`^\\s*- name: ${c}$`, 'm').test(configYml));
    expect(ausentes).toEqual([]);
  });

  it('oferece exatamente as categorias declaradas em categories.ts', () => {
    const noPainel = [...configYml.matchAll(/value: '([a-z-]+)' \}/g)].map((m) => m[1]).sort();
    const noCodigo = CATEGORIES.map((c) => c.slug).sort();

    expect(noPainel).toEqual(noCodigo);
  });

  it('repete os limites de tamanho que o Zod aplica', () => {
    // Se o Zod mudar e o painel não, o editor aceita e o build recusa.
    const limite = (campo: string) => {
      const m = new RegExp(`${campo}: z\\.string\\(\\)\\.min\\((\\d+)\\)\\.max\\((\\d+)\\)`).exec(
        contentConfig,
      );
      return m ? [m[1], m[2]] : null;
    };

    const title = limite('title');
    const description = limite('description');

    expect(title).not.toBeNull();
    expect(description).not.toBeNull();
    expect(configYml).toContain(`{${title?.[0]},${title?.[1]}}`);
    expect(configYml).toContain(`{${description?.[0]},${description?.[1]}}`);
  });

  it('grava imagem no caminho relativo que o `image()` do Astro resolve', () => {
    // O schema usa `image()`, que valida o arquivo e captura as dimensões no
    // build. Isso só funciona com caminho relativo à pasta do post.
    expect(configYml).toContain("media_folder: '../../assets/blog'");
    expect(configYml).toContain("public_folder: '../../assets/blog'");
  });

  it('grava a data no formato que o `z.coerce.date()` entende', () => {
    expect(configYml).toContain("format: 'YYYY-MM-DD'");
    // Sem `picker_utc`, o fuso do navegador do editor deslocaria a data.
    expect(configYml).toContain('picker_utc: true');
  });

  it('cria post como rascunho por padrão', () => {
    // Publicar sem querer é pior que esquecer de publicar.
    const bloco = /- name: draft[\s\S]*?default: (\w+)/.exec(configYml);
    expect(bloco?.[1]).toBe('true');
  });

  it('aponta para o mesmo domínio do site', () => {
    expect(configYml).toContain(`site_url: ${SITE.url}`);
  });

  it('gera slug em ASCII, porque o nome do arquivo vira a URL', () => {
    expect(configYml).toContain('encoding: ascii');
    expect(configYml).toContain('clean_accents: true');
  });

  it('usa apenas login por token, sem exigir servidor de OAuth', () => {
    expect(configYml).toMatch(/auth_methods:\s*\n\s*- token/);
  });
});

describe('painel aponta para o repositório certo', () => {
  it('o `repo` do config bate com o remote origin', () => {
    // Esta foi a causa de um bug real: o config ficou com o placeholder
    // `SEU-USUARIO/blog` depois que o remote já existia. O painel abre
    // normalmente, aceita o token, e só falha ao tentar ler a coleção — sem
    // mensagem que aponte para a configuração.
    let remote: string;
    try {
      remote = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    } catch {
      // Sem remote (clone novo, CI sem git): não há o que comparar.
      return;
    }

    const esperado = remote
      .replace(/^git@github\.com:/, '')
      .replace(/^https:\/\/github\.com\//, '')
      .replace(/\.git$/, '');

    expect(configYml).toContain(`repo: ${esperado}`);
  });

  it('não sobrou nenhum placeholder de configuração', () => {
    expect(configYml).not.toContain('SEU-USUARIO');
    expect(configYml).not.toMatch(/TROCAR/i);
  });
});
