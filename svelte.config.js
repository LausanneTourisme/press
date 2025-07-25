import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { readFileSync } from 'node:fs';

let json = readFileSync(path.resolve('./package.json'), 'utf8');
const pkg = JSON.parse(json);
json = readFileSync(path.resolve('./src/lib/translations/fr/lang.json'), 'utf8');
const supportedLocales = Object.keys(JSON.parse(json));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    version: {
      name: pkg.version
    },
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $enums: path.resolve('./src/lib/enums'),
      $types: path.resolve('./src/lib/types'),
    },

    prerender: {
      // NOTE: You can modify your exported error pages here.
      entries: supportedLocales.flatMap((locale) => [`/${locale}`, `/${locale}/401`, `/${locale}/403`, `/${locale}/404`, `/${locale}/500`]),
    }
  },
	preprocess: vitePreprocess(),
};

export default config;
