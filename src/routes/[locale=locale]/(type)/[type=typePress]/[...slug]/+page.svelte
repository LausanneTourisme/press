<script lang="ts">
  import { page } from '$app/state';
  import { ThemeKeys } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import PostContent from '$lib/components/PostContent.svelte';
  import { ucfirst } from '$lib/helpers';
  import { getThemeByTagName, ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { DateTime } from 'luxon';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';

  const release = $derived((page.data as PageData).release);
  const type = $derived((page.data as PageData).type);
  const hero = $derived(
    (page.data as PageData).release.content?.find((block) => block.type === 'hero')
  );
</script>

<Container fullscreen class="articles pt-5">
  <article data-id={release.id} transition:fade>
    <Container width="medium" class='pb-0'>
      <p>
        {ucfirst($t(`common.route-titles.${type}`))}
        &mdash; {DateTime.fromSeconds(parseInt(release.published_at ?? '0'))
          .setLocale($locale)
          .toFormat('dd MMMM, yyyy')}
      </p>
      {#if release.tags?.length}
        <p class="pt-2">
          {#each release.tags as tag}
            {@const theme = getThemeByTagName(tag.name)}
            {@const name = tag.public_name?.[$locale as Locale]}
            <span class="badge rounded-full bg-shakespeare-400 mr-2 border-0 py-3 text-white outline-0"
              >#&nbsp;{name}</span
            >
          {/each}
        </p>
      {/if}
      <hr class="mt-4 border border-gray-300" />
    </Container>
    <PostContent {hero} post={release} />
  </article>
</Container>
