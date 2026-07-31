import { SITE } from '~/config/site';

/**
 * Tempo de leitura calculado a partir do Markdown bruto.
 *
 * Feito em TypeScript, e não como plugin do processador de Markdown, por dois
 * motivos: funciona igual para `.md` e `.mdx` (que passam por caminhos
 * diferentes), e o valor fica disponível em `getCollection()` sem precisar
 * renderizar o post — é o que permite mostrar "8 min" nos cards da listagem
 * sem compilar 12 artigos por página.
 */

/**
 * Remove marcação que não é lida, preservando o texto que é.
 *
 * A ordem importa: blocos de código saem antes do código inline, e links têm o
 * rótulo preservado antes de a sintaxe de ênfase ser limpa.
 */
function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Frontmatter YAML no topo do arquivo.
      .replace(/^---\r?\n[\s\S]*?\r?\n---/, ' ')
      // Blocos de código: ninguém "lê" um bloco de código a 200 ppm.
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^ {4,}\S.*$/gm, ' ')
      // Imports/exports de MDX.
      .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
      // Tags HTML e JSX, mantendo o conteúdo entre elas.
      .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
      // Imagens saem por inteiro; links mantêm apenas o rótulo visível.
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Código inline.
      .replace(/`[^`\n]*`/g, ' ')
      // Marcadores de citação, título e lista no início da linha.
      .replace(/^\s{0,3}(?:[>#]+|[-*+]|\d+\.)\s+/gm, ' ')
      // Linhas horizontais e sintaxe de ênfase.
      .replace(/^\s{0,3}(?:[-*_]\s*){3,}$/gm, ' ')
      .replace(/[*_~]/g, ' ')
  );
}

/**
 * Conta palavras de um texto em pt-BR. Hífen e apóstrofo fazem parte da
 * palavra — "guarda-chuva" conta como uma, não duas.
 */
export function countWords(markdown: string): number {
  const matches = stripMarkdown(markdown).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
  return matches?.length ?? 0;
}

export interface ReadingTime {
  /** Minutos arredondados, nunca menor que 1. */
  minutes: number;
  words: number;
  /** Rótulo pronto para exibição: "7 min de leitura". */
  label: string;
}

export function getReadingTime(markdown: string): ReadingTime {
  const words = countWords(markdown);
  const minutes = Math.max(1, Math.round(words / SITE.wordsPerMinute));

  return { minutes, words, label: `${minutes} min de leitura` };
}
