# Port Plan: Jekyll → Astro (`speak.junglestar.org`)

Goal: replace the Jekyll build with Astro while keeping the shipped HTML in `_site/` as the visual / structural reference. Reach **single source of truth** by extracting every recurring fragment into an Astro component. **No SCSS** — only modern CSS (custom properties, nesting, `@layer`, logical properties, `light-dark()` where useful). All URLs, permalinks, RSS, sitemap, and post slugs must remain byte-stable for SEO.

## Status — done so far

- **Repo split:** Jekyll moved to `old/` (untouched, still buildable). Astro lives in `new/`. Final hoist to root is deferred until visual parity is signed off.
- **Astro 6.3.1** scaffolded in `new/` with `@astrojs/sitemap` 3.7 and `@astrojs/rss` 4.0.
- **Tooling pinned:** `packageManager: pnpm@11.1.1`, `engines.node: >=24.15.0`, plus `.nvmrc` + `.node-version` at `24.15.0`. `.npmrc` sets `engine-strict=false` + `verify-deps-before-run=false` so pnpm 11's pre-script auto-check doesn't block scripts.
- **All 593 posts** copied to `src/content/posts/`; `.markdown` renamed to `.md`. Content Collection uses the **glob loader** with a `generateId` callback that preserves original case (so `/BEM/`, `/Independence/` stay capitalised) and normalises en-dashes + spaces to ASCII hyphens (so `Dunning–Kruger-effect` → `Dunning-Kruger-effect`, matching Jekyll's permalinks).
- **Data JSON in `src/data/`:** `menu.json` and `categories.json` — neither is hardcoded in TS. `src/lib/categories.ts` is a 4-line typed loader.
- **CSS architecture:**
  - `src/styles/` holds **only** pan-component CSS: `tokens.css` (OKLCH brand colors + design tokens, snake_case custom props), `reset.css`, `base.css`, `bodies.css`, `svg_colors.css`, `utilities.css`. One `global.css` imports them under `@layer reset, tokens, layout, components, utilities, print`.
  - Component-specific CSS lives **inside each `.astro` component's scoped `<style>` block** (header, footer, cover, posts, indexes, balloons, tweet, etc.). Zero `.scss` files. Zero component CSS in `src/styles/`.
- **Components built:** `SvgDefs` (sprite inlined from `old/_includes/svg/defs.html` via Vite `?raw` import), `Icon`, `Favicons`, `Head`, `Header` (variant=`full|single`), `Nav`, `Footer`, `CategoryBadge` (collapses the 3 duplicated Liquid `{% if %}` chains into one source of truth), `PostCard`, `PostList`, `PostHeader`, `PostMeta`, `ExternalLinkBalloon` (collapses `goto`/`gocheck`/`alsocheck`), `TweetThis`, `RandomQuoteCover` (replaces `document.write` with an inline JSON island + small client script), `RefreshButton`, `CategoryIndex`. Scripts: `MenuToggle`, `ExtLink`, `QrToggle`, `LinksToggle`, `Analytics` (prod-gated).
- **Layouts:** `BaseLayout`, `PageLayout`, `HomeLayout`, `PostLayout` — mirror Jekyll's `default` / `home` / `page` / `no-foot+post`.
- **Pages:** `index.astro`, `[slug]/index.astro` (593 dynamic routes), 10 category index pages (`/kids/`, `/advice/`, `/singlish/`, `/serious/`, `/statement/`, `/catchphrases/`, `/english/`, `/geek/`, `/italiano/`, `/question/`), and `feed.xml.ts` (Astro RSS).
- **First build green:** 604 pages emitted in ~2s. Parity verified: every URL in `old/_site/` (603 dirs) is present in `new/dist/`.
- **Test pipeline (`pnpm test`):**
  1. `astro check` — 0 errors / 0 warnings / 9 hints (Zod `z` deprecation hints only — non-fatal).
  2. `vitest` — 16 tests across `excerpt`, `categories`, `parseDateFromId`. `parseDateFromId` extracted to `src/lib/date.ts` so tests don't need the `astro:content` virtual module.
  3. `tests/parity.mjs` — walks `old/_site/` and `new/dist/`, fails on any missing URL; warns on extras. Currently 603 verified, 1 extra (`/through-negation/`, a newer post added after the last Jekyll build).
- **Preview** runs cleanly: smoke-tested home, sample post, category index, feed, sitemap, mixed-case slug — all 200.

## Outstanding work

1. **Local Node upgrade** — user is still on Node 22 locally; `engines` requires 24+. Run `! source $(brew --prefix)/opt/nvm/nvm.sh && nvm install 24.15.0 && nvm use 24.15.0`.
2. **Visual parity polish** against `old/_site/` — component CSS is a structural first pass; spacing, typography, speech-bubble geometry, cover-face proportions, tilt sections, and the index card grid likely need tuning page by page.
3. **Zod deprecation hints** — Astro 6 deprecates importing `z` from `astro:content`. Migrate `src/content.config.ts` to the schema-callback form (`schema: ({ z }) => z.object({...})`) or import `z` from `astro/zod`.
4. **Strict URL validation** for `goto` / `gocheck` / `alsocheck` was relaxed to plain string because a handful of posts use bare domains (`3dar.com`). Either fix those frontmatter entries or accept the looser schema.
5. **Random-quote payload** is inlined as JSON on the homepage (~hundreds of KB of truncated post bodies). Acceptable for parity; can be split out to a fetched `/random.json` later.
6. **Cleanup commit** — once parity is signed off: tag `jekyll-final`, `git rm -r old/`, hoist `new/` to root with `git mv` so blame survives.

---

## 1. Inventory of the current Jekyll site

### Content
- `_posts/` — **593 markdown posts** with front matter (`title`, `categories`, `author`, `goto`, `go`, `gocheck`, `alsocheck`, optional `length`). Permalink: `/:title/` → `/<slug>/index.html`.
- `_data/menu.csv` — 8 nav items (Kids, Advices, Singlish, Serious, Statements, Catchphrases, English, Geek).
- Top-level category pages: `kid.html`, `advice.html`, `singlish.html`, `serious.html`, `statement.html`, `catchphrase.html`, `english.html`, `geek.html`, `italiano.html`, `question.html`. Each has `permalink:`, `slug:`, `seo_image:` and just includes `cat_index_content.html`.
- `index.html` → `layout: home` (random-quote header + 25-newest list).
- `feed.xml`, `robots.txt`, `assets/` (favicons, twittercard images, SVG icons), root PNGs (`can_only_create_the_future.png`, etc.), `android-chrome-192x192.png`.

### Layouts
- `_layouts/compress.html` — HTML minifier wrapper (Astro doesn't need it; built-in).
- `_layouts/default.html` — wraps content with `head` + `head_nav` + `footer` + scripts.
- `_layouts/home.html` — custom; cover header with **random quote written via `document.write` from a JS array of all 593 posts**, then `home_post_list.html`, note, footer.
- `_layouts/no-foot.html` — like `default` but for posts (no footer; uses `head_nav-single`; includes `links_toggle` script).
- `_layouts/post.html` (`layout: no-foot`) — wraps `post_content.html` + `tweet_this.html`.
- `_layouts/page.html` (`layout: default`) — for category pages.

### Includes (the recurring patterns to componentise)
- `head.html`, `favico.html`, `open_graph.html`
- `head_nav.html` / `head_nav-single.html` (almost identical — single hides `site_name__category`)
- `nav.html` — iterates `_data/menu.csv`
- `footer.html`
- `home_post_list.html` — newest-25 list with per-category SVG icon
- `cat_index_content.html` — same card grid filtered by category
- `post_content.html` — title + `post_icons.html` + optional `goto` / `gocheck` / `alsocheck` external-link "balloons" + body
- `post_icons.html` — category SVG badge + author
- `tweet_this.html` — share button
- `svg/defs.html` — inline SVG symbol sprite (all icons)
- `svg/use.html` — `<use xlink:href="#id">` helper
- Eight `script_*.html` snippets: `menu_toggle`, `qr_toggle`, `ext_link`, `links_toggle`, `progress`, `current_url`, `webfont`, `google_analytics`.

### Styling
- `_includes/main.scss` is inlined inside `<style>` in every page via `{% capture %}{% scssify %}`.
- `_sass/` partials: `base`, `bodies`, `cmq`, `cover`, `footer`, `goto`, `header`, `indexes`, `mixin_shadows`, `mixins`, `pages`, `posts`, `progress`, `speechbubble`, `svg_colors`, `tweet_this`.
- Design tokens defined as SCSS variables (font stack, `$brand_color: #40FF00`, radii, transitions, `$tilt_*`, etc.).

### Plugins replaced by Astro features
- `jekyll-seo-tag` → manual `<SEO>` component + per-page frontmatter.
- `jekyll-feed` → Astro `@astrojs/rss`.
- `jekyll-sitemap` → `@astrojs/sitemap`.
- `compress_html` → Astro production build minifies.
- `scssify` → Astro processes plain CSS / component `<style>` blocks.

---

## 2. Target Astro architecture

```
speak/
├─ astro.config.mjs                # site URL, integrations (sitemap, mdx)
├─ package.json                    # astro, @astrojs/sitemap, @astrojs/rss, @astrojs/mdx (optional)
├─ tsconfig.json
├─ public/
│  ├─ assets/                      # copy of current /assets (favicons, twittercard, icons, indexes_seo_images)
│  ├─ android-chrome-192x192.png
│  ├─ robots.txt
│  └─ (root PNGs that are linked by posts)
├─ src/
│  ├─ content/
│  │  ├─ config.ts                 # Zod schema for posts collection
│  │  └─ posts/                    # all 593 .md moved here (filename preserved → slug derived)
│  ├─ data/
│  │  ├─ menu.json                 # ported from _data/menu.csv
│  │  └─ categories.json           # category → icon id, label, slug, menu name
│  ├─ styles/                     # ONLY pan-component / global rules live here.
│  │  │                            # Component-specific CSS lives inside each .astro
│  │  │                            # component as a scoped <style> block — never here.
│  │  ├─ tokens.css                # :root custom properties (was main.scss vars)
│  │  ├─ reset.css                 # tiny modern reset (replaces normalize)
│  │  ├─ base.css                  # html/body, typography defaults, link defaults
│  │  ├─ bodies.css                # body-level classes (home/single/category) — cross-cutting
│  │  ├─ svg_colors.css            # .brand_color--fill / --stroke — used by many components
│  │  ├─ utilities.css             # .hide, .center, .no_select, etc. shared utilities
│  │  └─ global.css                # entry point: @layer + @import of the files above only
│  ├─ lib/
│  │  ├─ posts.ts                  # getCollection helpers, sortByDate, categoriseBy
│  │  ├─ excerpt.ts                # split on <!-- more --> + truncate words/chars
│  │  └─ categories.ts             # thin loader over data/categories.json + typed helpers
│  ├─ components/
│  │  ├─ Head.astro                # <title>, meta, canonical, OG, Twitter, favicons, GA preconnect
│  │  ├─ Favicons.astro            # was favico.html
│  │  ├─ SEO.astro                 # replaces jekyll-seo-tag (uses props + site defaults)
│  │  ├─ SvgDefs.astro             # full inline <svg><symbol/></svg> sprite
│  │  ├─ Icon.astro                # <Icon id="icn--geek" class="..." /> (replaces svg/use.html)
│  │  ├─ Header.astro              # header + site name + menu button
│  │  │                            #   prop: variant="full" | "single"  (replaces both head_nav variants)
│  │  ├─ Nav.astro                 # menu rendered from src/data/menu.ts
│  │  ├─ Footer.astro
│  │  ├─ CategoryBadge.astro       # the .ballon_background_icon + hidden text block (used in home,
│  │  │                            #   category lists, and post_icons) — single source of truth
│  │  ├─ PostCard.astro            # one card in a grid (truncate prop differs: 155 home / 99 cat)
│  │  ├─ PostList.astro            # grid wrapper (.home .posts | .archive.<slug> .posts)
│  │  ├─ PostHeader.astro          # h1 + meta (hidden date)
│  │  ├─ PostMeta.astro            # author + CategoryBadge
│  │  ├─ ExternalLinkBalloon.astro # one component, props: kind="goto"|"gocheck"|"alsocheck",
│  │  │                            #   href, label (replaces 3 near-duplicated blocks)
│  │  ├─ TweetThis.astro
│  │  ├─ RandomQuoteCover.astro    # cover header + client-side random pick (rewritten as a small
│  │  │                            #   <script> that reads a JSON island, replaces document.write)
│  │  ├─ RefreshButton.astro
│  │  └─ scripts/
│  │     ├─ MenuToggle.astro       # client-side, was script_menu_toggle.html
│  │     ├─ QrToggle.astro
│  │     ├─ ExtLink.astro
│  │     ├─ LinksToggle.astro
│  │     ├─ Progress.astro
│  │     └─ Analytics.astro        # gtag G-417J9W8JJ1
│  ├─ layouts/
│  │  ├─ BaseLayout.astro          # <!doctype>, <Head>, <SvgDefs>, body classes, slots:
│  │  │                            #   "header" (default <Header/>), default (content),
│  │  │                            #   "footer" (default <Footer/>), scripts slot.
│  │  │                            #   Body classes derived from props: { title, isHome, isSingle, categories }
│  │  ├─ PageLayout.astro          # wraps BaseLayout for the category pages (default.html parity)
│  │  ├─ HomeLayout.astro          # cover + RandomQuoteCover + RefreshButton + PostList limit=25 + note
│  │  └─ PostLayout.astro          # no-footer variant; PostHeader + balloons + <slot/> + TweetThis
│  └─ pages/
│     ├─ index.astro               # HomeLayout, latest 25
│     ├─ [slug]/index.astro        # getStaticPaths from posts collection → preserves /:title/ URLs
│     ├─ kids/index.astro          # PageLayout category=kid
│     ├─ advice/index.astro
│     ├─ singlish/index.astro
│     ├─ serious/index.astro
│     ├─ statement/index.astro
│     ├─ catchphrases/index.astro
│     ├─ english/index.astro
│     ├─ geek/index.astro
│     ├─ italiano/index.astro
│     ├─ question/index.astro
│     └─ feed.xml.ts               # @astrojs/rss, mirrors current feed.xml output
```

### Categories as the single source of truth

Data lives in **`src/data/categories.json`** (not in code). Astro / Vite import JSON natively, so any component can `import categories from '../data/categories.json'`. Editing categories does not require touching `.ts` / `.astro`.

`src/data/categories.json`:

```json
{
  "geek":        { "icon": "icn--geek",        "label": "This awesomely 'geek'.",        "slug": "geek",         "menu": "Geek" },
  "singlish":    { "icon": "icn--singlish",    "label": "This 'singlish' lah.",          "slug": "singlish",     "menu": "Singlish" },
  "catchphrase": { "icon": "icn--catchphrase", "label": "This is a mean 'catchphrase'.", "slug": "catchphrases", "menu": "Catchphrases" },
  "serious":     { "icon": "icn--serious",     "label": "This really 'serious'.",        "slug": "serious",      "menu": "Serious" },
  "italiano":    { "icon": "icn--italiano",    "label": "This 'italiano'.",              "slug": "italiano",     "menu": "Italiano" },
  "english":     { "icon": "icn--english",     "label": "This is proper 'english'.",     "slug": "english",      "menu": "English" },
  "kid":         { "icon": "icn--kid",         "label": "From the mouth of a kid.",      "slug": "kids",         "menu": "Kids" },
  "advice":      { "icon": "icn--advice",      "label": "An 'advice'.",                  "slug": "advice",       "menu": "Advices" },
  "statement":   { "icon": "icn--statement",   "label": "A 'statement'.",                "slug": "statement",    "menu": "Statements" },
  "question":    { "icon": "icn--question",    "label": "A 'question'.",                 "slug": "question",     "menu": "Questions" }
}
```

`src/data/menu.json` (ported from `_data/menu.csv`, can also be derived from `categories.json`):

```json
[
  { "name": "Kids",         "url": "/kids/" },
  { "name": "Advices",      "url": "/advice/" },
  { "name": "Singlish",     "url": "/singlish/" },
  { "name": "Serious",      "url": "/serious/" },
  { "name": "Statements",   "url": "/statement/" },
  { "name": "Catchphrases", "url": "/catchphrases/" },
  { "name": "English",      "url": "/english/" },
  { "name": "Geek",         "url": "/geek/" }
]
```

`src/lib/categories.ts` is a thin typed loader so components get autocomplete without duplicating data:

```ts
import data from '../data/categories.json';
export type CategoryKey = keyof typeof data;
export const CATEGORIES = data as Record<CategoryKey, {
  icon: string; label: string; slug: string; menu: string;
}>;
```

This collapses the 6-arm `{% if %}{% elsif %}` block that appears **three times** (home list, cat list, post icons) into one `<CategoryBadge category={post.data.categories[0]} />`.

This collapses the 6-arm `{% if %}{% elsif %}` block that appears **three times** (home list, cat list, post icons) into one `<CategoryBadge category={post.data.categories[0]} />`.

### Content collection schema (`src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';
export const collections = {
  posts: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      // date is parsed from filename (YYYY-MM-DD-...) in lib/posts.ts
      categories: z.string().transform(s => s.split(/\s+/)).or(z.array(z.string())),
      author: z.string().optional(),
      goto: z.string().url().optional(),
      go: z.string().optional(),
      gocheck: z.string().url().optional(),
      alsocheck: z.string().url().optional(),
      length: z.string().optional(),
      seo_image: z.string().optional(),
    }),
  }),
};
```

### Slug & permalink stability

Jekyll `permalink: /:title/` strips date + uses the `title` part of the filename. Astro Content Collections default to filename without the date prefix. Implement a `slug:` override in `lib/posts.ts` (or use the `slug` callback in `defineCollection`) to strip the leading `YYYY-MM-DD-`. Verify by diffing `astro build` output against `_site/` (every `_site/<slug>/index.html` must have a matching `dist/<slug>/index.html`).

---

## 3. CSS migration (SCSS → modern CSS)

### Where CSS lives — strict rule

- **`src/styles/` = global only.** Tokens, reset, body-level rules, brand-color SVG fills, and a handful of shared utilities. Anything cross-component.
- **Each `.astro` component owns its own CSS** in a scoped `<style>` block at the bottom of the file. `Header.astro` carries the `_header.scss` rules, `Footer.astro` carries `_footer.scss`, `PostCard.astro` carries `_posts.scss` card rules, `RandomQuoteCover.astro` carries `_cover.scss`, `PostList.astro` / category lists carry `_indexes.scss`, `ExternalLinkBalloon.astro` carries `_goto.scss`, `TweetThis.astro` carries `_tweet_this.scss`, `Progress.astro` carries `_progress.scss`, `CategoryBadge.astro` / cover headers carry `_speechbubble.scss`, etc.
- Astro scopes those `<style>` blocks automatically (data-attribute hashing), so component CSS cannot leak.
- **`global.css` must not import** any `header.css`, `footer.css`, `posts.css`, `cover.css`, `indexes.css`, `goto.css`, `tweet_this.css`, `progress.css`, `speechbubble.css`, `pages.css`. Those SCSS partials get rehoused **inside their owning component**, not as separate global files.
- Mapping cheat-sheet (SCSS partial → new home):
  - `_base.scss` → `src/styles/base.css` (global)
  - `_cmq.scss` → drop file; breakpoints become CSS custom properties in `tokens.css` and `@media` rules where needed
  - `_mixins.scss`, `_mixin_shadows.scss` → inline at call sites or `src/styles/utilities.css` when truly shared
  - `_bodies.scss` → `src/styles/bodies.css` (global; targets `<body>` classes)
  - `_svg_colors.scss` → `src/styles/svg_colors.css` (global)
  - `_header.scss` → `<style>` inside `Header.astro`
  - `_footer.scss` → `<style>` inside `Footer.astro`
  - `_cover.scss` → `<style>` inside `RandomQuoteCover.astro`
  - `_speechbubble.scss` → `<style>` inside `CategoryBadge.astro` (and the cover, if used there)
  - `_posts.scss` → split between `PostCard.astro` and `PostLayout.astro` / `PostHeader.astro`
  - `_indexes.scss` → `<style>` inside `PostList.astro`
  - `_pages.scss` → `<style>` inside `PageLayout.astro`
  - `_goto.scss` → `<style>` inside `ExternalLinkBalloon.astro`
  - `_progress.scss` → `<style>` inside `Progress.astro`
  - `_tweet_this.scss` → `<style>` inside `TweetThis.astro`

### Token + global mechanics

1. **Tokens** — convert every SCSS `$var` from `_includes/main.scss` and `_sass/_*.scss` into CSS custom properties on `:root` in `src/styles/tokens.css`:

   ```css
   :root {
     --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
     --html-font-size: 16px;
     --base-font-size: 1rem;
     --base-line-height: 1.1;
     --bubble-font-size: 1.5rem;
     --bubble-font-size-small: 1.25rem;
     --bubble-border-width: 20px;
     --author-ico-width: 150px;
     --brand-color: #40ff00;
     --dark-color: #000;
     --light-color: #fff;
     --alert-color: red;
     --twhite: rgb(255 255 255 / 0.5);
     --tblack: rgb(0 0 0 / 0.5);
     --border-radius: 5px;
     --border-size: 2px;
     --border-size-big: 4px;
     --vert-margin-size: 5px;
     --transition-duration: 400ms;
     --transition-duration-slow: 1s;
     --transition-function: cubic-bezier(.69, .2, .48, 1.47);
     --tilt-width: 100vw;
     --tilt-height: 50px;
   }
   ```

2. **Mixins** (`_mixins.scss`, `_mixin_shadows.scss`) — rewrite each as either a plain rule + utility class, or with CSS nesting / `@layer`. Anything used once → inline at the call site. Anything truly reused → utility class.

3. **`@import`s** — drop the SCSS chain. One `global.css` at `src/styles/global.css` imported once in `BaseLayout` (`import '../styles/global.css'`). It pulls in only the pan-component files listed above (tokens, reset, base, bodies, svg_colors, utilities). Component CSS is shipped via each component's own scoped `<style>` block — Astro deduplicates and code-splits per route.

4. **Modern reset** — replace the inlined normalize.css blob with a 20-line modern reset (`*, *::before, *::after { box-sizing: border-box }` etc.). Drop `box-sizing: content-box` — it is a 2015 holdover.

5. **`_cmq.scss`** breakpoints → CSS `@media`. Where the rule reads "when this element is narrow", use container queries.

6. **`svg_colors.scss`** → CSS custom prop `--brand-color` used in `.brand_color--fill { fill: var(--brand-color) }` and `.brand_color--stroke { stroke: var(--brand-color) }`.

7. **No `@apply`, no preprocessor.** CSS nesting is fine (baseline as of 2024). One `@layer reset, tokens, base, layout, components, utilities;` to keep specificity predictable.

8. **Per-component scoped styles are the default.** If a rule only applies inside one component, it MUST live in that component's `<style>` block, not in `src/styles/`. `src/styles/` is reserved for truly cross-cutting rules.

---

## 4. Scripts migration

Each `script_*.html` is a tiny vanilla JS block. Port as Astro components with a `<script>` tag (these are processed and bundled by Astro automatically; deduped across pages).

- `menu_toggle` → `<MenuToggle />` (toggles `#nav` class)
- `qr_toggle` → `<QrToggle />`
- `ext_link` → `<ExtLink />` (adds `target="_blank" rel="noopener"` to off-site links)
- `links_toggle` → `<LinksToggle />` (post-only — controls the 3 balloons)
- `progress` → `<Progress />` if still wanted
- `google_analytics` → `<Analytics id="G-417J9W8JJ1" />` — emit only when `import.meta.env.PROD`
- Drop `webfont` (unused once we use system stack) and `current_url` (replace with `Astro.url`).

**Random quote (home)** — today it injects all 593 truncated post bodies into the HTML and uses `document.write`. Replace with:
- a generated `src/pages/random.json.ts` or an inline `<script type="application/json" id="quotes">…</script>` populated at build time;
- a small client script that picks one and renders into `<blockquote>` (no `document.write`).
- `Math.random()` in `useState`-free vanilla JS, with the `/` link reloading the page.

---

## 5. Build, deploy, hosting

- Netlify (current). Replace Jekyll build with `astro build`. `publish = "dist"`.
- `astro.config.mjs`:
  ```js
  import { defineConfig } from 'astro/config';
  import sitemap from '@astrojs/sitemap';
  import mdx from '@astrojs/mdx';
  export default defineConfig({
    site: 'https://speak.junglestar.org',
    trailingSlash: 'always',
    build: { format: 'directory' },
    integrations: [sitemap(), mdx()],
  });
  ```
- Add `_redirects` only if any URL changes (goal: none).
- Remove `Gemfile`, `Gemfile.lock`, `.bundle/`, `_jekyll-cache/`, `.sass-cache/`, `_sass/`, `_includes/`, `_layouts/`, `_site/`, root category `.html` files **after** parity is verified.

---

## 6. Migration steps (in order)

1. **Scaffold.** `npm create astro@latest` in a sibling dir, then merge into repo on a branch. Add `@astrojs/sitemap`, `@astrojs/rss`, `@astrojs/mdx` (markdown will work without mdx, but mdx leaves the door open).
2. **Move posts.** Copy `_posts/*.md` → `src/content/posts/`. Write `lib/posts.ts` to strip the date prefix into `data.date` and generate the slug.
3. **Tokens + reset.** Create `src/styles/tokens.css` and `reset.css`. Wire into `BaseLayout`.
4. **SVG sprite.** Port `_includes/svg/defs.html` into `SvgDefs.astro`. Implement `Icon.astro`.
5. **Header / Nav / Footer.** Port `head_nav.html` + `head_nav-single.html` into one `Header.astro` with a `variant` prop. Move `_data/menu.csv` to `src/data/menu.json`; create `src/data/categories.json`.
6. **Layouts.** Build `BaseLayout`, `PageLayout`, `PostLayout`, `HomeLayout` to match the 4 Jekyll layouts.
7. **CategoryBadge + PostCard + PostList.** Wire `lib/categories.ts`. Delete the 3 duplicated `{% if %}` blocks.
8. **Pages.**
   - `src/pages/index.astro` (home, 25 newest).
   - `src/pages/[slug]/index.astro` (all 593 posts via `getStaticPaths`).
   - 10 category index pages.
9. **CSS sections.** Port each `_sass/_*.scss` into its plain-CSS sibling. Verify visually against `_site/` page-by-page for a handful of representative URLs:
   - `/` (home)
   - `/pep-talk/` (post with `goto` + `go: watch`)
   - `/geek/`, `/kids/`, `/catchphrases/` (category lists)
   - one post with `length`, one with `gocheck`, one with `alsocheck`.
10. **Scripts.** Port the 5 needed `script_*` snippets as components.
11. **RSS + sitemap.** Implement `src/pages/feed.xml.ts` matching `feed.xml`. Sitemap auto.
12. **SEO.** `SEO.astro` reproduces `jekyll-seo-tag` output (title pattern `jungle speaks about <title>`, OG, Twitter card with default `/assets/twittercard/twittercard.png`, canonical).
13. **Build parity check.** Run `astro build`. For each path in `_site/`, confirm a matching path in `dist/`. Spot-check rendered HTML diffs (whitespace excluded).
14. **Lighthouse + visual diff** on production deploy preview.
15. **Cleanup.** Once parity is signed off, delete Jekyll files (`_layouts`, `_includes`, `_sass`, `_posts` if moved, root category `.html`, `Gemfile*`, `.bundle`, `.sass-cache`, `.jekyll-cache`, `_site`, `gulpfile.js`, `vendor/`, `__lab/` if unused).

---

## 7. Risks / decisions to confirm before coding

- **`question.html` and `italiano.html`** exist as category pages but are not in `_data/menu.csv`. **Decision: keep them as accessible URLs, hidden from the menu.** `src/pages/question/index.astro` and `src/pages/italiano/index.astro` are built; `menu.json` stays at the original 8 entries.
- **Random-quote payload size** — embedding 593 truncated post bodies inline is ~hundreds of KB. Consider serving it as a separate `random.json` fetched on demand. Current behaviour ships it inline; matching that is fine for parity, optimising can be a follow-up.
- **`length` front matter** on posts toggles a body class (`.post.<length>`) — port faithfully even if rarely used.
- **`compress.html` layout** — Astro's prod build already minifies HTML; no replacement needed.
- **Removed scripts** (`webfont`, `current_url`) — confirm nothing depends on them.
- **`__lab/`, `vendor/`, `_js/`, root `*.png`** — confirm which are still referenced by posts before deleting; keep referenced ones in `public/`.

---

## 8. Acceptance criteria

- `dist/` contains an `index.html` for every URL currently in `_site/` (within ±a handful of intentionally dropped pages).
- Every category list page renders all posts in that category, newest first, matching `_site/`.
- `/feed.xml`, `/sitemap-index.xml`, `/robots.txt` resolve.
- Lighthouse: SEO ≥ 95, Best Practices ≥ 95, no console errors.
- Zero `.scss` files. `global.css` only imports pan-component files (tokens, reset, base, bodies, svg_colors, utilities). No component-specific CSS lives under `src/styles/`.
- One component per recurring fragment; no Liquid-style `{% if %}` chains duplicated across files.
