<script lang="ts">
  import { page } from "$app/state";
  import { locale, locales } from "$lib/translations";

  console.log({locale: $locale, locales: $locales, page: page.data})
</script>

<svelte:head>
  <title>About</title>
  <meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
  {page.data.i18n.locale}
</div>
