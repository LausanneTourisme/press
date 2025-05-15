<script lang="ts">
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';
  import Themes from '$lib/components/Themes.svelte';
  import type { PageData } from './$types';

  const pageData = page.data as PageData;
  const title = pageData.translations[pageData.i18n.locale]["themes.title"];
  const description = pageData.translations[pageData.i18n.locale]["themes.description"];
</script>

<Container fullscreen={true} class="mb-12">
  <Themes expanded={true} {title} paragraph={description} />
</Container>
