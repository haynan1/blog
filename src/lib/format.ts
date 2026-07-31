import { SITE } from '~/config/site';

/**
 * Formatação de data fixada em pt-BR e no fuso de São Paulo.
 *
 * O fuso é explícito porque o build roda na máquina do editor: sem ele, um post
 * publicado às 21h em São Paulo apareceria com a data do dia seguinte se a
 * máquina estivesse em UTC.
 */

const longDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: SITE.timeZone,
});

const shortDate = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: SITE.timeZone,
});

/** "12 de março de 2026" */
export function formatDate(date: Date): string {
  return longDate.format(date);
}

/** "12 de mar. de 2026" — para cards, onde a linha de metadados é apertada. */
export function formatDateShort(date: Date): string {
  return shortDate.format(date);
}

/** ISO 8601 completo, para `<time datetime>` e JSON-LD. */
export function toISO(date: Date): string {
  return date.toISOString();
}

/** Junta partes de URL sem gerar barra dupla nem barra final. */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE.url}${normalized === '/' ? '' : normalized.replace(/\/$/, '')}`;
}
