import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

function emptyToUndefined(v: unknown): unknown {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'string' && v.trim() === '') return undefined;
  return v;
}

const optStr = z.preprocess(emptyToUndefined, z.string().optional());

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/posts',
    // Preserve original case (e.g. /BEM/, /Independence/) but normalise
    // en-dashes and spaces to ASCII hyphens to match Jekyll's permalink behaviour.
    generateId: ({ entry }) =>
      entry
        .replace(/\.md$/, '')
        .replace(/[–—]/g, '-')
        .replace(/\s+/g, '-'),
  }),
  schema: z.object({
    title: z.string(),
    categories: z.union([
      z.string().transform((s) => s.split(/\s+/).filter(Boolean)),
      z.array(z.string()),
    ]),
    author: optStr,
    go: optStr,
    goto: optStr,
    gocheck: optStr,
    alsocheck: optStr,
    length: optStr,
    seo_image: optStr,
    layout: optStr,
  }),
});

export const collections = { posts };
