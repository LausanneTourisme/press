<script lang="ts">
  import { Cloudinary, type Transform } from '$lib/cloudinary';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import { onMount } from 'svelte';

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
      crop: 'fill'
    };
  });
</script>

<Container width={size === 'large' ? 'medium' : 'small'} class="flex justify-center">
  {#if size === 'small'}
    <Figure
      useCloudinaryPreset={false}
      class="small w-full max-w-md"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {:else if size === 'medium'}
    <Figure
      useCloudinaryPreset={false}
      class="medium w-full max-w-xl"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {:else}
    <Figure
      useCloudinaryPreset={false}
      class="large w-full max-w-2xl"
      src={cloudinaryId}
      {transform}
      {alt}
    />
  {/if}
</Container>
