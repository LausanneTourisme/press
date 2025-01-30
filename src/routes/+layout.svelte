<script lang="ts">
  import { page } from "$app/state";
  import Nav from '$lib/components/Nav.svelte';
  import { loadTranslations, locale } from '$lib/translations';
  import { onMount } from 'svelte';
  import '../app.pcss';

  let { children } = $props();
  
  onMount(async () => {
    await loadTranslations($locale);
  });
  //FIXME Add altenate routes in page state ! To do it, use type var in layout.server.ts and enum to get all slugs by locale and every layout.server use previous parentLayout.alternate !
</script>


<svelte:head>
  <title>{page.data.seo.title} • Lausanne Tourisme</title>
  <meta name="description" content={page.data.seo.description}>
  <meta name="robots" content="index,follow">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta charset="UTF-8">
  {#each page.data.seo.alternate as route}
      <link rel="alternate" hreflang={route.lang} href={route.href} />
  {/each}
  <link rel="icon" href="/favicon.png">
  <link rel="canonical" href={`${page.data.seo.canonical}${page.url.hash}`}>
  <!-- Open Graph -->
  <meta property="twitter:image" content={page.data.seo.image}>
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:title" content={page.data.seo.title}>
  <meta property="twitter:description" content={page.data.seo.description}>
  <meta property="og:image" content={page.data.seo.image}>
  <meta property="og:title" content={page.data.seo.title}>
  <meta property="og:description" content={page.data.seo.description} />
  <meta property="og:url" content={`${page.data.seo.canonical}${page.url.hash}`}>
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

<style lang="postcss">
  footer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 12px;
  }

  footer a {
    font-weight: bold;
  }

  @media (min-width: 480px) {
    footer {
      padding: 12px 0;
    }
  }
</style>
