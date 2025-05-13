<script lang="ts">
  import type { Transform } from '$lib/cloudinary';
  import { maxMobileWidth } from '$lib/helpers';
  import type { Hero } from '$types/releaseContents';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    hero: Hero;
  };

  let isMobile = $state(false);
  let { class: additionalClass = '', hero }: Props = $props();

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };
  const transform: Transform = $state({});

  const style: string = twMerge(
    'flex items-center',
    'md:min-h-[650px] min-h-[520px]',
    hero.color === 'white'
      ? 'text-white drop-shadow-lg'
      : 'text-gray-950 drop-shadow-lg drop-shadow-gray-100'
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

