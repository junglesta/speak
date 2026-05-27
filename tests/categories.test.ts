import { describe, it, expect, vi } from 'vitest';

// `categories.ts` now sources its data from the `categories` content collection.
// Outside the Astro runtime, stub `astro:content` so `getCollection('categories')`
// returns the entries parsed straight from the real YAML data file.
vi.mock('astro:content', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { parse } = await import('yaml');
  const raw = parse(
    readFileSync(fileURLToPath(new URL('../src/data/categories.yml', import.meta.url)), 'utf8'),
  ) as Record<string, Record<string, unknown>>;
  const entries = Object.entries(raw).map(([id, data]) => ({ id, data }));
  return { getCollection: async () => entries };
});

const { CATEGORIES, primaryCategory, categoryBySlug } = await import('../src/lib/categories');

describe('CATEGORIES', () => {
  it('exposes the 10 known categories', () => {
    expect(Object.keys(CATEGORIES).sort()).toEqual(
      ['advice', 'catchphrase', 'english', 'geek', 'italiano', 'kid', 'question', 'serious', 'singlish', 'statement'],
    );
  });

  it('every category has icon, label, slug, menu', () => {
    for (const info of Object.values(CATEGORIES)) {
      expect(info.icon).toMatch(/^icn--/);
      expect(info.label.length).toBeGreaterThan(0);
      expect(info.slug.length).toBeGreaterThan(0);
      expect(info.menu.length).toBeGreaterThan(0);
    }
  });
});

describe('primaryCategory', () => {
  it('returns null when given empty/undefined', () => {
    expect(primaryCategory(undefined)).toBe(null);
    expect(primaryCategory([])).toBe(null);
  });

  it('picks geek over advice when both present (priority order)', () => {
    expect(primaryCategory(['advice', 'geek'])).toBe('geek');
  });

  it('returns the single matching key', () => {
    expect(primaryCategory(['singlish'])).toBe('singlish');
  });
});

describe('categoryBySlug', () => {
  it('finds category by its url slug', () => {
    expect(categoryBySlug('kids')).toBe('kid');
    expect(categoryBySlug('catchphrases')).toBe('catchphrase');
    expect(categoryBySlug('geek')).toBe('geek');
  });
  it('returns null for unknown slug', () => {
    expect(categoryBySlug('nope')).toBe(null);
  });
});
