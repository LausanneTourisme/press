<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/state';
  import { RouteTypes, ThemeKeys, type RouteType } from '$enums';
  import Container from '$lib/components/Container.svelte';
  import { locale, t, type Locale } from '$lib/translations';
  import type { Post, Translatable } from '$types';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { DateTime } from 'luxon';
  import { getThemeByTagName, ThemeDetails } from '$lib/helpers/themes';
  import { twMerge } from 'tailwind-merge';
  import Heading from '$lib/components/Blocks/Heading.svelte';
  import Paragraph from '$lib/components/Blocks/Paragraph.svelte';
  import Hero from '$lib/components/Blocks/Hero.svelte';
  import type { Hero as HeroType } from '$types/releaseContents';

  const article: Post<Translatable> | undefined = $derived(page.data.article);
  const type: RouteType = $derived(page.data.type);
  const hero: undefined|HeroType = $derived(
    (page.data.article as undefined | Post<Translatable>)?.content?.find(
      (block) => block.type === 'hero'
    ) as undefined|HeroType
  );
</script>

<div class="text-column text-center">
  {$locale}
  <br />
  {$t(`route.${RouteTypes.Presskit}.slug`)} détails
</div>

<Container fullscreen>
  <article transition:fade>
    <Container width="medium">
      <p>
        {type}
        &mdash; {DateTime.fromSeconds(parseInt(article?.published_at ?? '0'))
          .setLocale($locale)
          .toFormat('dd MMMM, yyyy')}
      </p>
      {#if article?.tags?.length}
        <p class="pt-2">
          {#each article.tags as tag}
            {@const theme = getThemeByTagName(tag.name)}
            {@const name = tag.public_name?.[$locale as Locale]}
            {#if theme && name}
              <span
                class={twMerge(
                  'badge mr-2 border-0 py-3 text-white outline-0',
                  ThemeDetails[ThemeKeys[theme]].color
                )}>#&nbsp;{name}</span
              >
            {/if}
          {/each}
        </p>
      {/if}
      <hr class="mt-4 border border-gray-300" />
      {#if !hero}
        <Heading tag="h1">
          {article?.name?.[$locale as Locale]}
        </Heading>
        <Paragraph class="mb-6 leading-6 tracking-[0.45px]">
          <strong>
            {article?.summary?.[$locale as Locale]}
          </strong>
        </Paragraph>
      {/if}
    </Container>
    {#if hero}
      <Hero {hero} />
    {/if}
  </article>
</Container>
