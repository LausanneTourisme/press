<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import { loadTranslations, locale } from '$lib/translations';
  import { onMount } from 'svelte';
  import '../app.pcss';

  let { children } = $props();

  onMount(async () => {
    await loadTranslations($locale);
  });
</script>

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
