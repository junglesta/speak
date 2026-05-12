import { describe, it, expect } from 'vitest';
import { stripHtml, splitMore, truncateChars, excerpt, decodeEntities } from '../src/lib/excerpt';

describe('stripHtml', () => {
  it('removes tags and collapses whitespace', () => {
    expect(stripHtml('<p>Hello   <em>world</em>!</p>')).toBe('Hello world!');
  });
  it('returns empty for empty input', () => {
    expect(stripHtml('')).toBe('');
  });
  it('decodes &nbsp; and friends', () => {
    expect(stripHtml('lah&nbsp;&nbsp;&hellip;')).toBe('lah …');
  });
});

describe('decodeEntities', () => {
  it('handles named entities', () => {
    expect(decodeEntities('a&amp;b &lt;c&gt;')).toBe('a&b <c>');
  });
  it('handles numeric entities', () => {
    expect(decodeEntities('&#9733; star')).toBe('★ star');
  });
});

describe('splitMore', () => {
  it('keeps only the part before <!-- more -->', () => {
    expect(splitMore('intro\n<!-- more -->\nrest')).toBe('intro\n');
  });
  it('returns body unchanged when no marker', () => {
    expect(splitMore('plain text')).toBe('plain text');
  });
});

describe('truncateChars', () => {
  it('does not truncate short text', () => {
    expect(truncateChars('short', 10)).toEqual({ text: 'short', truncated: false });
  });
  it('truncates and appends ellipsis on a word boundary', () => {
    const r = truncateChars('a quick brown fox jumped over the lazy dog', 20);
    expect(r.truncated).toBe(true);
    expect(r.text.endsWith('…')).toBe(true);
    expect(r.text.length).toBeLessThanOrEqual(21);
  });
});

describe('excerpt', () => {
  it('combines strip + split + truncate', () => {
    const r = excerpt('<p>Hello <strong>world</strong></p><!-- more --><p>hidden</p>', 100);
    expect(r.text).toBe('Hello world');
    expect(r.truncated).toBe(false);
  });
});
