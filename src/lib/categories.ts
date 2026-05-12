import data from '../data/categories.json';

export type CategoryKey = keyof typeof data;
export type CategoryInfo = {
  icon: string;
  label: string;
  slug: string;
  menu: string;
};

export const CATEGORIES = data as Record<CategoryKey, CategoryInfo>;

const PRIORITY: CategoryKey[] = [
  'geek',
  'singlish',
  'catchphrase',
  'serious',
  'italiano',
  'english',
  'kid',
  'advice',
  'statement',
  'question',
];

export function primaryCategory(cats: string[] | undefined): CategoryKey | null {
  if (!cats) return null;
  for (const key of PRIORITY) {
    if (cats.includes(key)) return key;
  }
  return null;
}

export function categoryBySlug(slug: string): CategoryKey | null {
  for (const [key, info] of Object.entries(CATEGORIES)) {
    if (info.slug === slug) return key as CategoryKey;
  }
  return null;
}
