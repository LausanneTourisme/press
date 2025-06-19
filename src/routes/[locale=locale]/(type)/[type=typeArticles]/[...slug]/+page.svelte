<script lang="ts">
  import { page } from '$app/state';
  import { ThemeKeys } from '$enums';
  import InstagramBlock from '$lib/components/Blocks/Embed/Instagram.svelte';
  import YoutubeBlock from '$lib/components/Blocks/Embed/Youtube.svelte';
  import GalleryBlock from '$lib/components/Blocks/Gallery.svelte';
  import HeadingBlock from '$lib/components/Blocks/Heading.svelte';
  import HeroBlock from '$lib/components/Blocks/Hero.svelte';
  import ImageBlock from '$lib/components/Blocks/Image.svelte';
  import ParagraphBlock from '$lib/components/Blocks/Paragraph.svelte';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { ucfirst } from '$lib/helpers';
  import { getThemeByTagName, ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { DateTime } from 'luxon';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import PostContent from '$lib/components/PostContent.svelte';

  const article = $derived((page.data as PageData).article);
  const type = $derived((page.data as PageData).type);
  const hero = $derived(
    (page.data as PageData).article.content?.find((block) => block.type === 'hero')
  );
</script>

<Container fullscreen class="articles pt-5">
  <article transition:fade>
    <Container width="medium" class='pb-0'>
      <p>
        {ucfirst($t(`common.route-titles.${type}`))}
        &mdash; {DateTime.fromSeconds(parseInt(article.published_at ?? '0'))
          .setLocale($locale)
          .toFormat('dd MMMM, yyyy')}
      </p>
      {#if article.tags?.length}
        <p class="pt-2">
          {#each article.tags as tag}
            {@const theme = getThemeByTagName(tag.name)}
            {@const name = tag.public_name?.[$locale as Locale]}
            {#if theme && name}
              <span
                class={twMerge(
                  'badge rounded-full mr-2 border-0 py-3 text-white outline-0',
                  ThemeDetails[ThemeKeys[theme]].color
                )}>#&nbsp;{name}</span
              >
            {/if}
          {/each}
        </p>
      {/if}
      <hr class="mt-4 border border-gray-300" />
    </Container>
    <PostContent {hero} post={article}/>
  </article>
</Container>
