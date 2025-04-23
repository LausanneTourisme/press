<script lang="ts">
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';
  import Themes from '$lib/components/Themes.svelte';
  console.log();

  const title = page.data.translations[page.data.i18n.locale]["themes.title"];
  const description = page.data.translations[page.data.i18n.locale]["themes.description"];
</script>

<Container fullscreen={true} class="mb-12">
  <Themes expanded={true} {title} paragraph={description} />
</Container>
