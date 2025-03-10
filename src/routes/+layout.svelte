<script lang="ts">
  import { page } from '$app/state';
  import Nav from '$lib/components/Nav/Nav.svelte';
  import { loadTranslations, locale } from '$lib/translations';
  import { onMount } from 'svelte';
  import '../app.css';

  let { children } = $props();

  onMount(async () => {
    await loadTranslations($locale);
  });
</script>

<svelte:head>
  <title>{page.data.seo.title} • Lausanne Tourisme</title>
  <meta name="description" content={page.data.seo.description} />
  <meta name="robots" content="index,follow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="UTF-8" />
  {#each page.data.seo.alternate as route}
    <link rel="alternate" hreflang={route.lang} href={route.href} />
  {/each}
  <link rel="icon" href="/favicon.png" />
  <link rel="canonical" href={`${page.data.seo.canonical}${page.url.hash}`} />
  <!-- Open Graph -->
  <meta property="twitter:image" content={page.data.seo.image} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={page.data.seo.title} />
  <meta property="twitter:description" content={page.data.seo.description} />
  <meta property="og:image" content={page.data.seo.image} />
  <meta property="og:title" content={page.data.seo.title} />
  <meta property="og:description" content={page.data.seo.description} />
  <meta property="og:url" content={`${page.data.seo.canonical}${page.url.hash}`} />
</svelte:head>

<div class="app">
  <Nav />

  <main>
    {@render children()}
  </main>

  <footer>
    <p>
      visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to learn about SvelteKit
    </p>
  </footer>
</div>
