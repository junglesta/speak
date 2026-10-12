import type { APIRoute } from "astro";
import { CATEGORIES } from "../lib/categories";
import { getAllPosts, postCategories, postSlug } from "../lib/posts";
import { SITE } from "../lib/site";

// llms.txt (https://llmstxt.org): a plain-markdown map of the site for AI
// agents. Generated at build time so it always lists every post.
export const GET: APIRoute = async () => {
	const posts = await getAllPosts();
	const base = SITE.url.replace(/\/$/, "");

	const categories = Object.values(CATEGORIES)
		.map((c) => `- [${c.menu}](${base}/${c.slug}/): ${c.label}`)
		.join("\n");

	const quotes = posts
		.map((p) => {
			const by = p.data.author ? ` — ${p.data.author}` : "";
			const tags = postCategories(p).join(", ");
			return `- [${p.data.title}](${base}/${postSlug(p)}/)${by}${tags ? ` (${tags})` : ""}`;
		})
		.join("\n");

	const body = `# ${SITE.fullname}

> ${SITE.name} is a collection of ${posts.length} short quotes, catchphrases and sayings, one per page, each shown in a speech bubble with its author and tags. Content is licensed under the ${SITE.license.replace(/\.$/, "")} (${SITE.license_link}).

Each quote page lives at \`${base}/<slug>/\` and may link out to the source ("Go"), plus related reading ("Check", "Also").
Full-text search runs in the browser; a search can be shared as \`${base}/?search=<words>\`.

## Categories

${categories}

## Feeds

- [RSS feed](${base}/feed.xml): every quote, newest first
- [Sitemap](${base}/sitemap-index.xml): all URLs

## Optional

${quotes}
`;

	return new Response(body, {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
