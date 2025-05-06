<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/state';
  import { RouteTypes, type RouteType } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import { locale, t } from '$lib/translations';
  import type { Post } from '$types';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { DateTime } from 'luxon';

  const article: Post | undefined = $derived(page.data.article);
  const type: RouteType = $derived(page.data.type)

  onMount(() => {
  if (typeof window !== 'undefined') {
    if(dev) console.log(article);
    window.DateTime = DateTime;
  }
})
</script>

<div class="text-column text-center">
  {$locale}
  <br />
  {$t(`route.${RouteTypes.Presskit}.slug`)} détails
</div>

<Container fullscreen>
  <article transition:fade>
    <Container width="medium" class="pb-0">
      {DateTime.now().toSQLDate()} //TODO fix date
      <br>
      {article?.published_at}
      <br>
      {type}
        &mdash; {DateTime.fromSeconds(parseInt(article?.published_at ?? "0")).setLocale($locale).toFormat("dd MMMM, yyyy")}
    </Container>
  </article>
</Container>
