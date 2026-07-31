import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { SITE } from '~/config/site';

/**
 * A paleta inteira vive em custom properties no `global.css`. Estes testes
 * protegem os dois lugares onde essa regra não pode ser aplicada, e o piso de
 * contraste que a paleta precisa manter.
 *
 * Contraste é requisito, não preferência: metade dos leitores de um blog em
 * pt-BR chega pelo celular, muitas vezes sob luz direta.
 */

const css = readFileSync('src/styles/global.css', 'utf8');

/** Lê os tokens de um bloco `sel { ... }` do CSS. */
function lerTokens(seletor: string): Record<string, string> {
  const linhas = css.split('\n');
  const inicio = linhas.findIndex((l) => l.trim() === seletor);
  expect(inicio, `bloco ${seletor} não encontrado`).toBeGreaterThan(-1);

  const tokens: Record<string, string> = {};
  for (let i = inicio + 1; i < linhas.length && linhas[i]?.trim() !== '}'; i++) {
    const t = linhas[i]?.trim() ?? '';
    if (!t.startsWith('--')) continue;
    const [nome, valor] = t.replace(/;$/, '').split(':');
    if (valor?.trim().startsWith('#')) tokens[nome!.trim()] = valor.trim();
  }
  return tokens;
}

const claro = lerTokens(':root {');
const escuro = lerTokens('.dark {');

/** Luminância relativa (WCAG 2.1). */
function luminancia(hex: string): number {
  const canais = [1, 3, 5]
    .map((i) => parseInt(hex.substr(i, 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * canais[0]! + 0.7152 * canais[1]! + 0.0722 * canais[2]!;
}

function contraste(a: string, b: string): number {
  const [alto, baixo] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (alto! + 0.05) / (baixo! + 0.05);
}

describe('paleta: os dois temas são simétricos', () => {
  it('todo token do tema claro existe no escuro', () => {
    expect(Object.keys(escuro).sort()).toEqual(Object.keys(claro).sort());
  });

  it('nenhum token tem o mesmo valor nos dois temas', () => {
    // Um token idêntico nos dois temas quase sempre é esquecimento — e vira um
    // elemento que some no tema oposto.
    const iguais = Object.keys(claro).filter((k) => claro[k] === escuro[k]);
    expect(iguais).toEqual([]);
  });
});

describe('contraste WCAG', () => {
  const pares: Array<[string, string, string, number]> = [
    ['texto principal', '--c-ink', '--c-paper', 4.5],
    ['texto secundário', '--c-ink-muted', '--c-paper', 4.5],
    ['texto sutil', '--c-ink-subtle', '--c-paper', 4.5],
    ['acento sobre papel', '--c-ember', '--c-paper', 4.5],
    ['acento sobre card', '--c-ember', '--c-surface', 4.5],
    ['texto sobre card', '--c-ink', '--c-surface', 4.5],
    ['texto do botão primário', '--c-on-accent', '--c-ember', 4.5],
  ];

  for (const [nome, frente, fundo, minimo] of pares) {
    it(`${nome} passa em AA nos dois temas`, () => {
      for (const [tema, tokens] of [
        ['claro', claro],
        ['escuro', escuro],
      ] as const) {
        const fg = tokens[frente];
        const bg = tokens[fundo];
        expect(fg, `${frente} ausente no tema ${tema}`).toBeDefined();
        expect(bg, `${fundo} ausente no tema ${tema}`).toBeDefined();

        const razao = contraste(fg!, bg!);
        expect(razao, `${nome} no tema ${tema}: ${razao.toFixed(2)}:1`).toBeGreaterThanOrEqual(
          minimo,
        );
      }
    });
  }
});

describe('cores duplicadas fora do CSS', () => {
  it('theme-color do navegador acompanha o papel de cada tema', () => {
    // Uma meta tag não lê custom property, então esses dois valores são
    // copiados. Se a paleta mudar e eles não, a barra do navegador fica num
    // tom diferente do site — um degrau visível no topo da tela no celular.
    expect(SITE.themeColor.light).toBe(claro['--c-paper']);
    expect(SITE.themeColor.dark).toBe(escuro['--c-paper']);
  });

  it('nenhuma cor literal sobrou nas regras de componente', () => {
    // Os tokens ficam acima de `@theme inline`; daí para baixo é só regra, e
    // regra não deve trazer cor escrita à mão.
    const linhas = css.split('\n');
    const inicioRegras = linhas.findIndex((l) => l.includes('@theme inline'));
    const literais = linhas
      .slice(inicioRegras)
      .filter(
        (l) => /#[0-9a-fA-F]{3,8}\b/.test(l) && !l.trim().startsWith('*') && !l.includes('--c-'),
      );

    expect(literais).toEqual([]);
  });
});
