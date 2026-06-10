import { getCollection, type CollectionEntry } from "astro:content";
import { parseDateFromId } from "./date";

export { parseDateFromId };
export type Post = CollectionEntry<"posts">;

export function postSlug(post: Post): string {
	return parseDateFromId(post.id).slug;
}

export function postDate(post: Post): Date {
	return parseDateFromId(post.id).date;
}

export function postCategories(post: Post): string[] {
	const cats = post.data.categories;
	return Array.isArray(cats) ? cats : String(cats).split(/\s+/).filter(Boolean);
}

export async function getAllPosts(): Promise<Post[]> {
	const posts = await getCollection("posts");
	return posts.sort((a, b) => postDate(b).getTime() - postDate(a).getTime());
}

export async function getPostsByCategory(key: string): Promise<Post[]> {
	const all = await getAllPosts();
	return all.filter((p) => postCategories(p).includes(key));
}
