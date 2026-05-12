import { describe, it, expect } from 'vitest';
import { CATEGORIES, primaryCategory, categoryBySlug } from '../src/lib/categories';

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
