<script lang="ts">
  import { Cloudinary } from '$lib/cloudinary';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';

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
  let url: string = $state('');

  $effect(() => {
    url = Cloudinary.make(cloudinaryId).url({
      w: isMobile ? window.innerWidth : Math.round(window.innerWidth / 1.4),
      ar: '1:1',
      g: focus,
      c: 'fill'
    });
  });
</script>

<Container width={size === 'large' ? 'medium' : 'small'} class="flex justify-center">
  {#if size === 'small'}
    <Figure class="small aspect-square w-full max-w-md" src={url} {alt} />
  {:else if size === 'medium'}
    <Figure class="medium aspect-square w-full max-w-xl" src={url} {alt} />
  {:else}
    <Figure class="large aspect-square w-full max-w-3xl" src={url} {alt} />
  {/if}
</Container>
