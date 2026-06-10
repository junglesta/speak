# Changelog — SPEAK (Astro)

All notable changes to the Astro build. Versions follow [semver](https://semver.org/).
Production at `speak.junglestar.org` builds from this repo via Netlify (since 3.0.0).

## [Unreleased]

_Nothing yet._

---

## 3.6.4 — 2026-06-10

### Added
- **3 new posts** — *Dilution soluble*, *dumb joke*, *United till divided* (Paul Graham, 2009-03-09).

### Changed
- **Deps**: `astro` 6.3.8 → 6.4.6, `vitest` 4.1.7 → 4.1.8, `wrangler` 4.95.0 → 4.99.0.

---

## 3.6.3 — 2026-05-27

### Added
- **`DEPLOY.md`** — a copy-paste manual-deploy guide for devs: one-time setup (`corepack`/`pnpm install`/`wrangler login`), manual deploy (`pnpm deploy`), triggering/checking CI, production verification, and rollback — each command annotated with *what it does* and *why*.

### Docs
- README points at `DEPLOY.md` and adds the `pnpm deploy` script row; corrected the stale "Workers Builds" hosting note to **GitHub Actions** (matches the current deploy pipeline).

---

## 3.6.2 — 2026-05-27

### Added
- **`public/_headers`** — ports the security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) and the immutable `/_astro/*` cache rule from the old `netlify.toml` to Cloudflare Workers static assets (which would otherwise serve `_astro/*` with only `max-age=0`).

### Changed
- **Footer host credit: Netlify → Cloudflare** (new `cloudflare.svg` cloud icon, links to cloudflare.com).

### Removed
- **`netlify.toml`** and **`netlify.svg`** — no longer hosted on Netlify.

### Docs
- README: refreshed changelog highlights, repo-layout tree (`.github/workflows/`, `public/_headers`). `PLAN.md` marked **archived** (predates the Cloudflare/YAML changes). CI: run bundled actions on Node 24 to clear the Node 20 deprecation notice.

---

## 3.6.1 — 2026-05-27

### Added
- **Robust CI deploy via GitHub Actions** (`.github/workflows/deploy.yml`). Every push to `source` (plus a manual trigger) runs `pnpm install → build → test`, then `wrangler deploy` to Cloudflare Workers — deploy is gated on the test suite. Replaces the unreliable dashboard Workers Builds auto-deploy; needs repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

---

## 3.6.0 — 2026-05-27

### Added
- **Cloudflare Web Analytics.** Added the Cloudflare beacon (`beacon.min.js`) in `Analytics.astro`, prod-gated, running **alongside** the existing Google Analytics (GA retained, not replaced). Token stored as `cloudflare_analytics_token` in `site.yml`.

---

## 3.5.3 — 2026-05-27

### Changed
- **README reflects the Cloudflare move.** Replaced the dead Netlify deploy-status badge with static stack badges (Astro, Cloudflare Workers, license) — Cloudflare has no official live deploy-status badge. Updated the stack list (Netlify → Cloudflare Workers static assets via Workers Builds; Astro 6.3.8), the repo-layout tree (`netlify.toml` → `wrangler.jsonc`; `data/` now `site.yml, categories.yml, nav.json`), and credits.

---

## 3.5.2 — 2026-05-27

### Fixed
- **Cloudflare build: approve the `workerd` build script.** Set `workerd: true` under `allowBuilds` in `pnpm-workspace.yaml` so Wrangler's runtime binary installs in CI — without it `wrangler deploy` crashed on startup (`ERR_PNPM_IGNORED_BUILDS`). Also dropped the dead `pnpm` field from `package.json` (ignored since pnpm 11; the config lives in `pnpm-workspace.yaml`).

---

## 3.5.1 — 2026-05-27

### Added
- **Cloudflare Workers (static assets) deploy config.** `wrangler.jsonc` serves the built `dist/` directory (`html_handling: auto-trailing-slash` to match Astro's `trailingSlash: 'always'`), plus a `deploy` script and `wrangler` dev dependency. Production deploys move from Netlify to Cloudflare via Workers Builds (git-connected to `source`).

---

## 3.5.0 — 2026-05-27

### Changed
- **Site config moved to `src/data/site.yml`.** All the variables that drive the site (name, url, email, description, keywords, license, social, analytics) now live in a single YAML file instead of being hardcoded in `src/lib/site.ts`. `site.ts` is now a thin loader that parses the YAML (via a `?raw` import) and exports the same `SITE` object, so every consumer (`Head`, `Footer`, `Header`, `HomeLayout`, `TweetThis`, `Analytics`, `feed.xml`) is unchanged.
- **Categories consolidated into `src/data/categories.yml`, loaded the canonical Astro way.** The old `src/data/categories.json` (definitions) and the separate priority list are merged into one YAML, each category carrying a `priority` field. A new `categories` content collection (`file()` loader + Zod schema in `content.config.ts`) is the source of truth; `lib/categories.ts` reads it via `getCollection` while keeping its synchronous public API (`CATEGORIES`, `primaryCategory`, `categoryBySlug`).
- **Renamed `src/data/menu.json` → `src/data/nav.json`** (and its binding in `Nav.astro`) so the filename matches what it drives.

### Added
- **Two new posts** — "hopelessly over-optimistic" and "carrots better than sticks".
- **`.zed/settings.json`** disables the YAML language-server schema store, so plain config YAML (e.g. `site.yml`, an Ansible-reserved name) is no longer mis-validated against unrelated schemas.

### Removed
- **`src/data/categories.json`** — superseded by `categories.yml`.

### Security
- **Resolves the `devalue` DoS advisory** (sparse-array deserialization, affected `>= 5.6.3, <= 5.8.0`). Bumping `astro` to 6.3.8 pulls the patched transitive `devalue@5.8.1`, closing the Dependabot alert.

### Maintenance
- Added the `yaml` dependency; bumped `astro`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, and `vitest` to current patches.

---

## 3.4.0 — 2026-05-14

### Added
- **Search entry in the nav menu (nested popover).** `Nav.astro` gets a "Search" row at the top of the menu with the magnifier icon and uppercase label, styled to match the page links. The button uses `popovertarget="search_popover"` so it opens the search popover *while the menu popover stays open* — a true nested-popover stack (Esc unwinds search first, then the menu). `SearchOverlay.astro` accepts a new `showTrigger` prop so the popover element can still render without the FAB.

### Changed
- **Search FAB now flows in the DOM** instead of being `position: fixed`. Uses `margin-block-start: var(--corner_inset)` for the same visual corner, with `position: relative; z-index: 4` so it stays above the home cover's dark fill (Header is z-index 3).
- **FAB scoped to the home page only.** `BaseLayout.astro` passes `showTrigger={!!isHome}`; category/listing pages reach search through the nav menu's new "Search" row, not via a floating button.
- **Home top row alignment.** `RandomQuoteCover.astro` gets `margin-block-start: calc((2.5rem + var(--corner_inset)) * -1)` so the cover pulls up under the FAB row — the cover's refresh icon (top-right) now sits on the same horizontal line as the search FAB (top-left).
- **Footer headline replaced with logo.** The uppercase "SPEAK" wordmark swaps for the JungleSpeak baseball-hat-face SVG (`baseballhat.svg`), sized at `clamp(120px, 25vw, 240px)` — roughly half the cover hat's scale — wrapped in a home link.

### Removed
- **Footer top border.** The `border-block-start` line separating the footer from the dark body above is gone; footer now flows directly out of the page background.
- **Green band below the post grid.** `.posts` lost its bottom padding (`calc(var(--spaceV) * 1.2)` → `0`), so the green `.home`/`.archive` wrapper ends at the last card row instead of trailing a green strip into the dark body.

### Fixed
- **`.note:empty` collapses cleanly.** Added `.note:empty { display: none; }` so the home-only newest-quotes note never reserves visual space (or renders a stripe) when it has no content.

---

## 3.3.1 — 2026-05-14

### Added
- **Version tag in the footer.** The "{SITE.name} project has {postCount} concepts!" catchphrase now reads "SPEAK project v3.3.1 has 593 concepts!" — version pulled from `package.json` so it updates automatically on every bump. Styled with `font: inherit` + 60 % opacity + tabular-nums so it sits quietly inside the sentence.

### Fixed
- **`.footer__catchphrase` display.** It was inheriting `display: flex` from `.footer__section p`, which turned the new inline `<span>` into a flex item and broke the line into three centred columns. Bumped the selector to `.footer__section p.footer__catchphrase` (specificity 0,2,1) so `display: block` actually wins, restoring normal inline flow for all three catchphrases.

---

## 3.3.0 — 2026-05-14

### Added
- **Shareable search URLs.** `SearchOverlay.astro` syncs the query to `?search=…` via `history.replaceState` as you type, and on page load with that param the popover auto-opens and runs the search. Copy/paste the URL to share a specific search.
- **"Share this search" button** in the popover. Copies the current URL to the clipboard via `navigator.clipboard.writeText`, briefly flips to "Copied to clipboard" for ~1.8 s, then reverts. Hidden when the query is empty; cleared from the URL when the popover closes.
- **Category search.** `PostLayout.astro` emits a hidden `<span hidden>` after the speaker block listing the post's categories, so Pagefind indexes them and typing a category slug (e.g. `kid`, `chatphrase`) returns matching posts. Placed at the tail of `data-pagefind-body` so any rare excerpt that surfaces them reads as a trailing tag rather than a leading keyword.

### Changed
- **Search result card redesigned.** Title now sits in green caps *above* the green bubble; the bubble contains only the highlighted excerpt; author byline moves *below* the bubble in green. The card-level hover/focus styles drive a brand-coloured outline that grows from 2 → 6 px offset around the bubble (matches the landing quote treatment). Card-to-card spacing bumped to 2 rem.
- **Author icon** replaced with a small disc face built like `serious.svg` — green circle, two `--dark_color` eye dots, and a flat mouth — instead of the head-and-shoulders silhouette, so it matches the site's iconography.
- **"SEARCH" label** moved to the top-right of the popover (mirroring the close X on the top-left), bumped from `0.875rem` to `1.125rem` / weight 600.
- **Landing random-quote hover.** Stopped recolouring the link text on hover (it fought the bubble fill); the bubble itself now grows a 2 px brand outline with a 2 → 6 px offset transition. The inner anchor's `:focus-visible` outline is suppressed in favour of the bubble outline.

---

## 3.2.0 — 2026-05-13

### Added
- **Site search** via [Pagefind](https://pagefind.app/). Runs as a post-build step (`astro build && pagefind --site dist`), indexing only `data-pagefind-body` regions on post pages (593 docs indexed).
- `SearchOverlay.astro` — fixed-position FAB (magnifying glass, top-left) that opens a full-viewport popover using the native HTML Popover API. Brand-styled, vanilla DOM, no Pagefind UI bundle. Lazy-loads `/pagefind/pagefind.js` on first open.
- `src/icons/search.svg` — magnifier icon (currentColor stroke).
- Result template surfaces post `title` (small, dimmed, uppercase label) + highlighted excerpt (prominent quote) + author byline with inline person silhouette.
- 6-step responsive post-grid: 1 → 2 (≥ 32rem) → 3 (≥ 48rem) → 5 (≥ 126.5rem / 2024px). 4- and 6-column rules are intentionally absent.

### Changed
- Dropdown menu (`Nav.astro`) rewritten to use the native Popover API, matching the search overlay — full-viewport dark backdrop, brand-green link list, close-X in the same spot as the trigger. Removes anchored-dropdown positioning glitches on wide screens.
- Both menu trigger buttons (header and home-band) now declare `popovertarget="nav"`; the bridging JS in `HomeLayout.astro` is gone.
- Single post bubble (`.post_content`) padding now `clamp(0.8rem, 2vw, 2rem) clamp(0.5rem, 4vw, 3rem)` — mobile parity preserved, breathing room added on desktop.
- `PostCard` odd-card face lift toned down — `--face-y` now `-20%` mobile / `-35%` ≥ 32rem (was `-40%` / `-65%`).
- Search overlay input restyled minimal (no border, single thin underline that brightens on focus); native WebKit clear button repainted brand-green via `mask`.
- Footer CC license badge fixed via inline SVG rewrite + new sibling `by.svg` (already shipped in 3.1.0; this release tunes the stacked layout gap).

### Removed
- `src/components/scripts/MenuToggle.astro` — obsolete now that the popover handles open/close natively.
- `src/pages/search.astro` — replaced by the global overlay; `/search/` route is intentionally 404.
- Pipe characters (`| Author |`) bracketing the search-result author line.

### Fixed
- Search results no longer duplicate the title/author inside the excerpt — `data-pagefind-meta` spans now also carry `data-pagefind-ignore`.
- Dynamically-injected search result HTML now picks up styling — selectors wrapped in `:global()` since `innerHTML` markup doesn't get Astro's scoped-CSS attribute hash.

---

## 3.1.0 — 2026-05-13

### Added
- `<main>` landmark wrapper in `BaseLayout` (a11y best-practice).
- `--spaceV: 5dvh` and `--spaceH: 5dvw` dynamic spacing tokens; migrated layout-level paddings (page wrappers, header, footer, hero, mobile nav, post-grid) to use them so spacing breathes with the viewport.
- `src/icons/by.svg` — Creative Commons Attribution badge, rendered stacked under the CC badge in the footer license line.
- `inlineStylesheets: 'auto'` in `astro.config.mjs` — small per-component CSS is inlined, removing render-blocking requests.

### Changed
- `--corner_inset` switched from `1rem` → `4vw` (mobile-equivalent value, now scales).
- Bubble font sizes and tail size moved to `clamp()` with mobile-floor mins.
- Renamed CSS token `--bubble_border_width` → `--bubble_tail_size` (clearer name; same role).
- `400` is the new default body weight site-wide — removed all `font-weight: 700` declarations (`h1-h4`, `.post_body`, `.site__name`, `.page_link`).
- `PostCard` bubble margins switched from `dvw` (viewport) → `%` (grid cell) so bubbles never overflow at 2/3/4-column breakpoints.
- `PostCard` face icon offset now driven by `--face-x` / `--face-y` custom props, varying per breakpoint and odd/even card.
- `PostList` diagonal black-to-green slash flipped horizontally and now applied to `.archive::before` as well as `.home::before`.
- Footer CC icon: replaced cramped legacy artwork with the canonical Creative Commons path; rendered alongside a stacked BY badge.
- `Head.astro`: preconnect target corrected from `google-analytics.com` → `googletagmanager.com` (the origin the gtag script actually loads from).
- `robots.txt`: removed stray `<...>` wrapping the Sitemap URL and pointed at the real `sitemap-index.xml` emitted by `@astrojs/sitemap`.
- `SITE.name` casing updated to `SPEAK`; added `fullname: "JUNGLE SPEAK"`.

### Removed
- 12 unused CSS tokens (`--bubble_font_size`, `--bubble_font_size_small`, `--alert_color`, `--twhite`, `--tblack`, `--border_size_big`, `--vert_margin_size`, `--transition_duration_slow`, `--tilt_width`, `--tilt_height`, `--bp_small`, `--bp_medium`, `--bp_large`).
- Dead `.center` utility class.
- "There's a menu at the top of this page…" sentence from the home `.note` paragraph (kept the leading newest-quotes line).
- Baked-in `<title>baseballhat</title>` on the hero SVG (overrode the component's accessible name).

### Fixed
- Hero hat icon now exposes `aria-label="JungleSpeaks"` instead of a hidden `aria-hidden`.
- `.footer__icon` flex children no longer shrink below `1.75rem` (`flex: none`).
- CC license badge rendering — single source viewBox plus brand-colour fill.

---

## 3.0.1 — 2026-05-13

### Fixed
- `README.md`: image paths corrected (now point at `public/`) so GitHub renders them.
- `README.md` rewritten end-to-end: dropped Jekyll/Gulp/Bundler instructions; added Astro stack overview, pnpm quick-start, repo-layout map, scripts table, authoring-a-quote example, changelog summary.

---

## 3.0.0 — 2026-05-13

### Cutover — Astro replaces Jekyll in production

### Added
- `netlify.toml` at repo root: pnpm + Node 24 build command, publish dir `dist`, security headers, aggressive cache for `/_astro/*`.
- `jekyll-final` tag on the last pre-cutover commit of `source` — rollback anchor.

### Changed
- **Repo hoisted to root.** `new/*` contents promoted to `/`; `old/` deleted entirely.
- `.gitignore` simplified for the Astro layout (node_modules, dist, .astro at root).
- `tests/parity.mjs` degrades to a build-smoke check when `old/_site` is absent (post-cutover mode) — verifies dist has ≥580 URLs + `feed.xml` + `robots.txt`.

### Notes
- Production now serves from Netlify's Astro build (Node 24.15.0 / pnpm 11.1.1 / Astro 6.3.1).
- If anything breaks: revert the merge commit on `source`, the previous Jekyll build is preserved at the `jekyll-final` tag.

---

## 2.1.0 — 2026-05-13

### Added
- `src/icons/<name>.svg`: 27 per-icon files extracted from the legacy sprite, each rendered as a standalone Astro SVG component.
- `src/styles/components.css` with shared `.border_button` component class (used by `.go_to_source`, `.tweet_this_button`, etc.); wired into `global.css` under `@layer components`.
- `--corner_inset` design token (`tokens.css`) — single source of truth for the distance of top-right icons from the viewport edge.
- Home: black title band with diagonal CSS-border slash leading into the green post grid; in-band menu trigger bridged to the header's `#menu_switch`.
- Home cover: top-right refresh anchor inside the cover; full-viewport (`min-block-size: 100dvh`) black background.
- Nav: close (×) button, alphabetical sort, post-count badge per category, dimmed-green styling for the current page.
- Vitest: HTML entity decode tests (`decodeEntities`) — 19/19 passing.
- `pnpm-workspace.yaml` allows `esbuild` and `sharp` build scripts and disables pnpm 11's pre-script deps verification.

### Changed
- Zod: `import { z } from 'astro/zod'` (was `from 'astro:content'`) — clears all 9 deprecation hints from `astro check`.
- Content collection: `generateId` callback preserves original filename case (`/BEM/`, `/Independence/`) and normalises en-dashes + spaces to ASCII hyphens for Jekyll-compatible slugs.
- Single post: speech bubble flipped to green-on-dark with tail pointing down; face anchored below the bubble; `goto`/`gocheck`/`alsocheck` buttons moved out of the bubble into `.speaker` below the author; TweetThis label trimmed from "Click to Tweet this" → "Tweet this" with external-link icon appended.
- Header: uppercase always (`text-transform: uppercase`), weight 250, asymmetric inline padding so the menu icon hugs the right edge; on category pages `:has(.site_name__category)` dims both `Jungle` and `Speak`.
- Index cards: transparent background, face anchored bottom-right (alternating bottom-left on `:nth-child(even)`), black mini-bubble with tail pointing up.
- Footer: all text + icons in `var(--brand_color)`, weight 400; QR icon de-bordered and enlarged; heart switched to outlined `&#9825;`; Netlify recoloured via `currentColor`; CC viewBox normalised; description rendered with poetic line breaks.
- Dropdown: full-viewport on mobile (≤48rem) with springy `scaleY` transition preserved.
- `excerpt()`: decodes named + numeric HTML entities so `&nbsp;` and friends don't leak into card text.

### Removed
- `SvgDefs.astro`, `Icon.astro`, `svg_sprite.svg`, `PostHeader.astro`, `PostMeta.astro`, `RefreshButton.astro` — all superseded by the per-icon imports and inline component markup.

### Notes
- **Netlify untouched.** Production still serves the last Jekyll build from `source` branch.
- Tests: `astro check` 0 errors / 0 warnings, vitest 19/19, parity 603/603 URLs vs `old/_site`.

---

## 2.0.0 — 2026-05-12

### Added
- Initial Astro 6.3.1 project under `new/` running alongside the Jekyll `old/`.
- 593 posts copied into `src/content/posts/`; all `.markdown` files normalised to `.md`.
- Content collection with Zod schema, lib helpers (`posts`, `categories`, `excerpt`, `date`), and `src/data/{menu,categories}.json` as single source of truth.
- Components: `Head`, `Header` (variants `full`/`single`), `Nav`, `Footer`, `Favicons`, `CategoryBadge`, `PostCard`, `PostList`, `PostHeader`, `PostMeta`, `ExternalLinkBalloon`, `TweetThis`, `RandomQuoteCover`, `RefreshButton`, `Icon`, `SvgDefs`, `CategoryIndex`, plus client scripts (`MenuToggle`, `ExtLink`, `QrToggle`, `LinksToggle`, `Analytics`).
- Layouts: `BaseLayout`, `PageLayout`, `HomeLayout`, `PostLayout`.
- Pages: `index.astro`, dynamic `[slug]/index.astro` (593 routes), 10 category index pages (`/kids/`, `/advice/`, `/singlish/`, `/serious/`, `/statement/`, `/catchphrases/`, `/english/`, `/geek/`, `/italiano/`, `/question/`), `feed.xml.ts`.
- CSS architecture: snake_case + `@layer` (`tokens`, `reset`, `base`, `bodies`, `svg_colors`, `utilities`), OKLCH brand colors, component-scoped `<style>` blocks.
- Test pipeline (`pnpm test`): `astro check` + `vitest` (16/16) + `tests/parity.mjs` (603/603 URLs vs `old/_site/`).
- Tooling pinned: `packageManager: pnpm@11.1.1`, `engines.node: >=24.15.0`, `.nvmrc` / `.node-version` at `24.15.0`, `.npmrc` with `engine-strict=false` + `verify-deps-before-run=false`.

### Migration
- Repo split into `old/` (Jekyll, still buildable, still authoritative for production) and `new/` (Astro WIP).
- Branch `astro-migration` created off `source` and pushed to GitHub; `source` not touched.
