import { getCollection } from "astro:content";

export type CategoryKey = string;
export type CategoryInfo = {
	icon: string;
	label: string;
	slug: string;
	menu: string;
};

// Load the `categories` collection once at module init. Top-level await keeps
// the exports below synchronous, so consumers don't need to change.
const entries = await getCollection("categories");

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = Object.fromEntries(
	entries.map((e) => [e.id, e.data]),
);

const PRIORITY: CategoryKey[] = [...entries]
	.sort((a, b) => a.data.priority - b.data.priority)
	.map((e) => e.id);

export function primaryCategory(
	cats: string[] | undefined,
): CategoryKey | null {
	if (!cats) return null;
	for (const key of PRIORITY) {
		if (cats.includes(key)) return key;
	}
	return null;
}

export function categoryBySlug(slug: string): CategoryKey | null {
	for (const [key, info] of Object.entries(CATEGORIES)) {
		if (info.slug === slug) return key;
	}
	return null;
}
