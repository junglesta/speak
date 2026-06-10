import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE } from "../lib/site";
import { getAllPosts, postSlug, postDate } from "../lib/posts";

export const GET: APIRoute = async (context) => {
	const posts = await getAllPosts();
	return rss({
		title: SITE.name,
		description: SITE.description,
		site: context.site ?? SITE.url,
		items: posts.map((p) => ({
			title: p.data.title,
			link: `/${postSlug(p)}/`,
			pubDate: postDate(p),
			description: p.body?.slice(0, 500) ?? "",
		})),
	});
};
