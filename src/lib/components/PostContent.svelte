<script lang="ts">
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
  import { locale, type Locale } from '$lib/translations';
  import type { PostType, Translatable } from '$types';
  import type { Hero } from '$types/releaseContents';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    hero?: Hero;
    post: PostType<Translatable>;
  };

  const { class: additionalClass, hero, post }: Props = $props();
</script>

<div class="content">
  {#if hero}
    <HeroBlock {hero} class="pt-0" />
  {:else}
    <Container width="medium" class='py-0'>
      <Heading tag="h1">
        {post?.name?.[$locale as Locale]}
      </Heading>
      <Paragraph class="leading-6 tracking-[0.45px]">
        <strong>
          {post?.summary?.[$locale as Locale]}
        </strong>
      </Paragraph>
    </Container>
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
  {#if post.content}
    {#each post.content as block}
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
          cloudinaryId={block.value.cloudinary_id ?? 'default'}
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
</div>
