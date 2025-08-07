import adapter from '@sveltejs/adapter-node';
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
      name: `Presskit v${pkg.version}`
    },
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $enums: path.resolve('./src/lib/enums'),
      $types: path.resolve('./src/lib/types'),
    },

  }
};

export default config;
