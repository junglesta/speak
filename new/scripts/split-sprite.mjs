#!/usr/bin/env node
// One-shot: split the legacy SVG sprite into per-icon .svg files
// at src/icons/<name>.svg. Each output is a standalone <svg> ready for
// Astro's `import Icon from './icon.svg'` pattern.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const SPRITE = resolve(ROOT, 'src/components/svg_sprite.svg');
const OUT_DIR = resolve(ROOT, 'src/icons');

mkdirSync(OUT_DIR, { recursive: true });

const sprite = readFileSync(SPRITE, 'utf8');
const re = /<symbol\s+id="(icn--[^"]+)"\s+viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/g;

let count = 0;
let m;
while ((m = re.exec(sprite)) !== null) {
  const id = m[1];
  const viewBox = m[2];
  const inner = m[3].trim();
  const name = id.replace(/^icn--/, '').replace(/--/g, '_');
  const filename = resolve(OUT_DIR, `${name}.svg`);

  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
${inner}
</svg>
`;
  writeFileSync(filename, out);
  console.log(`✓ ${name}.svg`);
  count++;
}
console.log(`\n${count} icons extracted to ${OUT_DIR}`);
