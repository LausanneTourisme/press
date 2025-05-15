<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes, ThemeKeys } from '$enums';
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
  import { getThemeByTagName, ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { ucfirst } from '$lib/helpers';

  const data = page.data as PageData;
  const article = $derived(data.article);
  const type = $derived(data.type);
  const hero = $derived(data.article.content?.find((block) => block.type === 'hero'));
  onMount(() => console.log(article));
</script>

<Container fullscreen class="articles">
  <article transition:fade>
    <Container width="medium" class={hero && 'pb-0'}>
      <p>
        {ucfirst($t(`route.${type}.slug`))}
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
      <HeroBlock {hero} class="pt-0" />
    {/if}

    <!--
    -
    -
    -
    - CONTENT >>>>>>>>>>>>>>>>>>>>>>>
    -
    -
    -
    -->
    {#if article.content}
      {#each article.content as block}
        {#if block.type === 'heading'}
          <Container width="medium">
            <HeadingBlock tag={block.tag}>
              {@html block.value[$locale as Locale]}
            </HeadingBlock>
          </Container>
        {:else if block.type === 'paragraph'}
          <Container width="medium" class="py-0 md:py-0">
            <ParagraphBlock>
              {@html block.value[$locale as Locale]}
            </ParagraphBlock>
          </Container>
        {:else if block.type === 'image'}
          <ImageBlock
            metadata={block.value.metadata}
            size={block.size}
            focus={block.focus}
            cloudinaryId={block.value.cloudinary_id ?? ''}
            alt={`${block.value?.public_name?.fr ?? ''} - ${block.value?.copyright}`}
          />
        {:else if block.type === 'instagram'}
          <Container width="medium" class="mb-6 flex justify-center py-0 md:py-0">
            <InstagramBlock url={block.value} />
          </Container>
        {:else if block.type === 'gallery'}
          <Container width="medium" class="py-0 md:py-0">
            <GalleryBlock images={block.value} />
          </Container>
        {:else if block.type === 'youtube'}
          <Container width="medium" class="">
            <YoutubeBlock src={block.value} />
          </Container>
        {:else if block.type === 'embed'}
          <div class="embed my-4 w-full">
            {@html block.value}
          </div>
        {/if}
      {/each}
    {/if}
  </article>
</Container>
