# Changelog — SPEAK (Astro)

All notable changes to the Astro build. Versions follow [semver](https://semver.org/).
Production at `speak.junglestar.org` builds from this repo via Netlify (since 3.0.0).

## [Unreleased]

_Nothing yet._

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
