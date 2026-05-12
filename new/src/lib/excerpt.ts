const HTML_TAG = /<[^>]*>/g;
const WHITESPACE = /\s+/g;
const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
};
const ENTITY_RE = /&(?:nbsp|amp|lt|gt|quot|#39|apos|hellip|ndash|mdash);/g;
const NUMERIC_ENTITY_RE = /&#(\d+);/g;

export function decodeEntities(s: string): string {
  return s
    .replace(ENTITY_RE, (m) => ENTITIES[m] ?? m)
    .replace(NUMERIC_ENTITY_RE, (_, code) => String.fromCodePoint(Number(code)));
}

export function stripHtml(s: string): string {
  return decodeEntities(s.replace(HTML_TAG, '')).replace(WHITESPACE, ' ').trim();
}

export function splitMore(body: string): string {
  const i = body.indexOf('<!-- more -->');
  return i >= 0 ? body.slice(0, i) : body;
}

export function truncateChars(s: string, max: number): { text: string; truncated: boolean } {
  if (s.length <= max) return { text: s, truncated: false };
  let cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.6) cut = cut.slice(0, lastSpace);
  return { text: cut.replace(/[\s.,;:!?]+$/, '') + '…', truncated: true };
}

export function excerpt(rawBody: string, maxChars: number) {
  return truncateChars(stripHtml(splitMore(rawBody)), maxChars);
}
