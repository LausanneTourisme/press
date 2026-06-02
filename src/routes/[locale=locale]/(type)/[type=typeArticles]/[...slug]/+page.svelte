<script lang="ts">
  import { page } from '$app/state';
  import { ThemeKeys } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import PostContent from '$lib/components/PostContent.svelte';
  import { ucfirst } from '$lib/helpers';
  import { getThemeByTagName, ThemeDetails } from '$lib/helpers/themes';
  import { t, type Locale } from '$lib/translations';
  import { DateTime } from 'luxon';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';

  const locale = $derived(page.params.locale!);
  const article = $derived((page.data as PageData).article);
  const type = $derived((page.data as PageData).type);
  const hero = $derived(
    (page.data as PageData).article.content?.[locale]?.find((block) => block.type === 'hero')
  );
</script>

<Container fullscreen class="articles pt-5">
  <article transition:fade>
    <Container width="medium" class="pb-0">
      <p>
        {ucfirst($t(`common.route-titles.${type}`))}
        &mdash; {DateTime.fromSeconds(parseInt(article.published_at ?? '0'))
          .setLocale(locale)
          .toFormat('dd MMMM, yyyy')}
      </p>
      {#if article.tags?.length}
        <p class="pt-2">
          {#each article.tags as tag (tag.name)}
            {@const theme = getThemeByTagName(tag.name)}
            {@const name = tag.public_name?.[locale]}
            {#if theme && name}
              <span
                class={twMerge(
                  'badge mr-2 rounded-full border-0 py-3 text-white outline-0',
                  ThemeDetails[ThemeKeys[theme]].color
                )}>#&nbsp;{name}</span
              >
            {/if}
          {/each}
        </p>
      {/if}
      <hr class="mt-4 border border-gray-300" />
    </Container>
    <PostContent {hero} post={article} {locale} />
  </article>
</Container>
