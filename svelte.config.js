import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { readFileSync } from 'node:fs';

const json = readFileSync(path.resolve('./package.json'), 'utf8');
const pkg = JSON.parse(json);


/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    version: {
      name: `Presskit v${pkg.version}`
    },
    adapter: adapter(),
    alias: {
      $enums: path.resolve('./src/lib/enums'),
      $types: path.resolve('./src/lib/types'),
    },

  }
};

export default config;
