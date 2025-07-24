<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import type { Transform } from '$types';
  import { onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    isMobile?: boolean;
    cloudinaryId: string;
    alt: string;
    size: 'small' | 'medium' | 'large' | 'parallax';
    focus?: 'face' | 'auto';
  };
  const {
    class: additionalClass = '',
    cloudinaryId,
    alt,
    size,
    isMobile = false,
    focus = 'auto'
  }: Props = $props();
  let transform: Transform = $state({});

  onMount(() => {
    transform = {
      width: isMobile ? window.innerWidth : Math.round(window.innerWidth / 1.4),
      gravity: focus,
      crop: 'auto'
    };
  });
</script>

<Container
  width={size === 'large' ? 'medium' : 'small'}
  class={twMerge('flex justify-center', additionalClass)}
>
  {#if size === 'small'}
    <Figure
      useCloudinaryPreset={false}
      class="small aspect-square w-full max-w-md"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {:else if size === 'medium'}
    <Figure
      useCloudinaryPreset={false}
      class="medium aspect-square w-full max-w-xl"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {:else}
    <Figure
      useCloudinaryPreset={false}
      class="large aspect-square w-full max-w-3xl"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {/if}
</Container>
