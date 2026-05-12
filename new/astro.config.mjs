import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://speak.junglestar.org',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
