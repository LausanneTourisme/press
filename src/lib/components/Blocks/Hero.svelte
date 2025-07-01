<script lang="ts">
  import type { Transform } from '$lib/cloudinary';
  import { maxMobileWidth } from '$lib/helpers';
  import type { Hero } from '$types/releaseContents';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import Image from './Image.svelte';
  import { locale, type Locale } from '$lib/translations';
  import Container from '../Container.svelte';
  import Heading from '../Heading.svelte';
  import Paragraph from '../Paragraph.svelte';

  type Props = {
    class?: string;
    hero: Hero;
  };

  const { class: additionalClass = '', hero }: Props = $props();
  let isMobile = $state(false);

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };
  const transform: Transform = $state({});

  const style: string = twMerge('flex items-center md:min-h-[650px] min-h-auto py-6', additionalClass);

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
  alt="{hero.image.public_name?.[$locale as Locale]} - {hero.image.copyright}"
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
      {hero.value[$locale as Locale]}
    </Heading>
    {#if hero.lead?.[$locale as Locale]}
      <Paragraph class={hero.color === 'white'
      ? 'text-white drop-shadow-lg drop-shadow-black text-xl'
      : 'text-gray-950 drop-shadow-lg drop-shadow-gray-100'}>
        {hero.lead[$locale as Locale]}
      </Paragraph>
    {/if}
  </Container>
</Image>
