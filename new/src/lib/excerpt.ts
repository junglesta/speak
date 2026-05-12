const HTML_TAG = /<[^>]*>/g;
const WHITESPACE = /\s+/g;

export function stripHtml(s: string): string {
  return s.replace(HTML_TAG, '').replace(WHITESPACE, ' ').trim();
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
