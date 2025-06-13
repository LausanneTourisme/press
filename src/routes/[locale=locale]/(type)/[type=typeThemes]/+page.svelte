<script lang="ts">
  import { page } from '$app/state';
  import Container from '$lib/components/Container.svelte';
  import Themes from '$lib/components/Themes.svelte';
  import type { PageData } from './$types';

  const title = $derived((page.data as PageData).translations[(page.data as PageData).i18n.locale]["themes.title"]);
  const description = $derived((page.data as PageData).translations[(page.data as PageData).i18n.locale]["themes.description"]);
</script>

<Container fullscreen={true} class="mb-12">
  <Themes expanded={true} {title} paragraph={description} />
</Container>
