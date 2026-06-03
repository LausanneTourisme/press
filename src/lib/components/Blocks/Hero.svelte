<script lang="ts">
  import { maxMobileWidth } from '$lib/helpers';
  import type { Hero } from '$types/releaseContents';
  import { onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import Image from './Image.svelte';
  import { type Locale } from '$lib/translations';
  import Container from '../Container.svelte';
  import Heading from '../Heading.svelte';
  import Paragraph from '../Paragraph.svelte';
  import type { Transform } from '$types';

  type Props = {
    class?: string;
    hero: Hero;
    locale: Locale;
  };

  const { class: additionalClass = '', hero }: Props = $props();
  let isMobile = $state(false);

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };
  const transform: Transform = $state({ width: 1920, height: 1280 });

  const style: string = $derived(
    twMerge('flex items-center md:min-h-[650px] min-h-auto py-6', additionalClass)
  );

  onMount(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  });

  $effect(() => {
    if (isMobile) {
      transform.h = window.screen.height;
    } else {
      transform.w = window.screen.width;
    }
  });
</script>

<Image
  class={style}
  size="parallax"
  fixed={false}
  focus="auto"
  cloudinaryId={hero.image.cloudinary_id ?? 'default'}
  alt="{hero.image.public_name} - {hero.image.copyright}"
>
  <Container
    width="small"
    class="my-auto h-full shadow-gray-950 [text-shadow:_0_0_20px_var(--tw-shadow-color)]"
  >
    <Heading
      tag="h1"
      class={hero.color === 'white'
        ? 'text-white shadow-gray-950 drop-shadow-lg'
        : 'text-gray-950 drop-shadow-lg drop-shadow-gray-100'}
    >
      {hero.value}
    </Heading>
    {#if hero.lead}
      <Paragraph
        class={hero.color === 'white'
          ? 'text-xl text-white drop-shadow-lg drop-shadow-black'
          : 'text-gray-950 drop-shadow-lg drop-shadow-gray-100'}
      >
        {hero.lead}
      </Paragraph>
    {/if}
  </Container>
</Image>
