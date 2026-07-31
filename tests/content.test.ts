import { describe, expect, it } from 'vitest';

import { getReadingTime } from '~/lib/reading-time';
import { absoluteUrl, formatDate, toISO } from '~/lib/format';

/**
 * `reading-time` é uma sequência de regex sobre texto livre — a classe de
 * código que quebra ao ser "melhorada". `absoluteUrl` monta toda tag canonical
 * do site: uma barra a mais e o Google indexa duas URLs para a mesma página.
 */

describe('getReadingTime', () => {
  it('conta palavras de texto simples', () => {
    expect(getReadingTime('uma duas três quatro cinco').words).toBe(5);
  });

  it('trata palavra hifenizada como uma só', () => {
    // "guarda-chuva" é uma palavra. Contar duas infla o tempo de leitura.
    expect(getReadingTime('guarda-chuva').words).toBe(1);
    expect(getReadingTime('João D’Ávila').words).toBe(2);
  });

  it('ignora o frontmatter', () => {
    const md = `---\ntitle: 'Um título com várias palavras aqui'\ntags: ['a','b']\n---\n\numa duas três`;
    expect(getReadingTime(md).words).toBe(3);
  });

  it('ignora blocos de código', () => {
    const md = 'uma duas\n\n```js\nconst a = 1; const b = 2; const c = 3;\n```\n\ntrês';
    expect(getReadingTime(md).words).toBe(3);
  });

  it('preserva o rótulo do link, descarta a URL', () => {
    // O leitor lê "documentação do Astro", não o endereço.
    expect(getReadingTime('Veja a [documentação oficial](https://docs.astro.build)').words).toBe(4);
  });

  it('descarta imagens por inteiro', () => {
    expect(getReadingTime('![uma legenda descritiva](../../assets/x.jpg)\n\numa duas').words).toBe(
      2,
    );
  });

  it('não conta marcadores de lista nem de título', () => {
    expect(getReadingTime('## Um título\n\n- item um\n- item dois').words).toBe(6);
  });

  it('descarta sintaxe de ênfase', () => {
    expect(getReadingTime('**negrito** _itálico_ normal').words).toBe(3);
  });

  it('nunca devolve menos de 1 minuto', () => {
    expect(getReadingTime('oi').minutes).toBe(1);
    expect(getReadingTime('').minutes).toBe(1);
  });

  it('arredonda com base em 200 ppm', () => {
    const md = Array.from({ length: 1000 }, () => 'palavra').join(' ');
    expect(getReadingTime(md).minutes).toBe(5);
  });

  it('o rótulo está em português', () => {
    expect(getReadingTime('uma duas três').label).toBe('1 min de leitura');
  });
});

describe('absoluteUrl', () => {
  it('monta URL absoluta a partir de caminho relativo', () => {
    expect(absoluteUrl('/blog/post')).toBe('https://www.contracorrente.com.br/blog/post');
  });

  it('aceita caminho sem barra inicial', () => {
    expect(absoluteUrl('blog/post')).toBe('https://www.contracorrente.com.br/blog/post');
  });

  it('a raiz não ganha barra final', () => {
    // `trailingSlash: 'never'` — o canonical precisa concordar com o sitemap.
    expect(absoluteUrl('/')).toBe('https://www.contracorrente.com.br');
  });

  it('remove a barra final de qualquer caminho', () => {
    expect(absoluteUrl('/blog/')).toBe('https://www.contracorrente.com.br/blog');
  });

  it('não mexe em URL que já é absoluta', () => {
    expect(absoluteUrl('https://exemplo.com/x')).toBe('https://exemplo.com/x');
  });

  it('nunca gera barra dupla', () => {
    for (const p of ['/', '/blog', 'blog', '/blog/', '/a/b/c']) {
      expect(absoluteUrl(p).replace('https://', '')).not.toContain('//');
    }
  });
});

describe('formatação de data', () => {
  it('formata em português', () => {
    expect(formatDate(new Date('2026-03-12T15:00:00Z'))).toBe('12 de março de 2026');
  });

  it('usa o fuso de São Paulo, não o UTC da máquina', () => {
    // 2026-03-13T01:00Z é ainda dia 12 em São Paulo (UTC-3). Sem o timeZone
    // fixo, o build numa máquina em UTC publicaria a data errada.
    expect(formatDate(new Date('2026-03-13T01:00:00Z'))).toBe('12 de março de 2026');
  });

  it('toISO devolve ISO 8601 completo', () => {
    expect(toISO(new Date('2026-03-12T15:00:00Z'))).toBe('2026-03-12T15:00:00.000Z');
  });
});
