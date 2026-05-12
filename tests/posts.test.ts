import { describe, it, expect } from 'vitest';
import { parseDateFromId } from '../src/lib/date';

describe('parseDateFromId', () => {
  it('parses YYYY-MM-DD-slug', () => {
    const r = parseDateFromId('2013-02-08-pep-talk');
    expect(r.slug).toBe('pep-talk');
    expect(r.date.toISOString().slice(0, 10)).toBe('2013-02-08');
  });

  it('falls back to epoch + raw id for non-conforming filenames', () => {
    const r = parseDateFromId('random-thing');
    expect(r.slug).toBe('random-thing');
    expect(r.date.getTime()).toBe(0);
  });
});
