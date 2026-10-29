import node from '@sveltejs/adapter-node';
import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { readFileSync } from 'node:fs';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const json = readFileSync(path.resolve('./package.json'), 'utf8');
const pkg = JSON.parse(json);

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      version: { name: `Presskit v${pkg.version}` },
      adapter:
        process.env.ENVIRONMENT === 'node'
          ? node({ out: process.env.BUILD_DIR || 'build' })
          : vercel()
    })
  ],
  build: { rollupOptions: { external: ['msw', 'msw/node'] } }
});
