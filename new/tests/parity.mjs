#!/usr/bin/env node
// Compare new/dist with old/_site. Pass if every URL the Jekyll build emits has
// a counterpart in the Astro build. Soft warnings for stuff Astro intentionally
// reshapes (sitemap filenames, etc.).

import { readdir, stat, access } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { constants } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', '..');
const OLD = join(ROOT, 'old', '_site');
const NEW = join(ROOT, 'new', 'dist');

const KNOWN_DELTA = new Set([
  // Jekyll-only artefacts we don't need to reproduce
  'feed.xml', // re-emitted by Astro RSS at the same path
  'sitemap.xml', // Astro emits sitemap-index.xml + sitemap-0.xml instead
  '404.html', // not configured (yet)
]);

async function dirExists(p) {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p) {
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// Recursively collect all "URL paths" represented by index.html files inside `root`.
// Returns a Set of paths relative to root, like "pep-talk", "kids", "".
async function collectUrls(root) {
  const urls = new Set();
  async function walk(dir, rel) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      if (e.name === '_astro' || e.name === 'assets') continue;
      const full = join(dir, e.name);
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        await walk(full, r);
      } else if (e.name === 'index.html') {
        urls.add(rel);
      }
    }
  }
  await walk(root, '');
  return urls;
}

async function main() {
  const errors = [];
  const warnings = [];

  if (!(await dirExists(OLD))) {
    errors.push(`old/_site missing at ${OLD}`);
  }
  if (!(await dirExists(NEW))) {
    errors.push(`new/dist missing at ${NEW} — run \`pnpm build\` first`);
  }
  if (errors.length) {
    for (const e of errors) console.error('✗', e);
    process.exit(1);
  }

  const oldUrls = await collectUrls(OLD);
  const newUrls = await collectUrls(NEW);

  console.log(`old/_site URLs: ${oldUrls.size}`);
  console.log(`new/dist URLs: ${newUrls.size}`);

  // Every URL in old must exist in new.
  const missing = [];
  for (const u of oldUrls) {
    if (!newUrls.has(u)) missing.push(u);
  }

  // Extras in new are usually fine but we report them.
  const extras = [];
  for (const u of newUrls) {
    if (!oldUrls.has(u)) extras.push(u);
  }

  // Required top-level non-HTML resources.
  for (const f of ['feed.xml', 'robots.txt']) {
    if (!(await fileExists(join(NEW, f)))) {
      errors.push(`missing ${f} in new/dist`);
    }
  }

  // Sitemap: Astro emits sitemap-index.xml.
  if (!(await fileExists(join(NEW, 'sitemap-index.xml')))) {
    warnings.push('no sitemap-index.xml — sitemap integration may be off');
  }

  // Heuristic: at least 580 post URLs (we have 593 posts; allow a tiny delta).
  const postLikeNew = [...newUrls].filter((u) => u && !u.includes('/') && u !== 'kids' && u !== 'advice' && u !== 'singlish' && u !== 'serious' && u !== 'statement' && u !== 'catchphrases' && u !== 'english' && u !== 'geek' && u !== 'italiano' && u !== 'question');
  if (postLikeNew.length < 580) {
    errors.push(`expected ≥580 post URLs in new/dist, got ${postLikeNew.length}`);
  }

  for (const u of missing) {
    if (KNOWN_DELTA.has(u)) {
      warnings.push(`(known delta) missing in new: /${u}/`);
    } else {
      errors.push(`missing in new: /${u}/`);
    }
  }

  for (const u of extras) {
    warnings.push(`extra in new: /${u}/`);
  }

  for (const w of warnings) console.warn('!', w);

  if (errors.length) {
    for (const e of errors) console.error('✗', e);
    console.error(`\nparity FAILED (${errors.length} error${errors.length === 1 ? '' : 's'})`);
    process.exit(1);
  }

  console.log(`\nparity OK — ${oldUrls.size} URLs verified, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
