<script lang="ts">
  import { type Transform } from '$lib/cloudinary';
  import { twMerge } from 'tailwind-merge';
  import Image from './Media/Image.svelte';

  interface Props {
    src?: string;
    alt?: string;
    transform?: Transform;
    crop?: boolean;
    width?: number;
    height?: number;
    class?: string;
    imgClass?: string;
  }

  const {
    class: additionalClass,
    imgClass,
    src = '',
    alt = '',
    transform,
    crop = true,
    width = 0,
    height = 0
  }: Props = $props();

  let figure: HTMLElement | undefined = $state();

  const removeBackground = () => {
    figure?.classList.remove('bg-loading', 'animate-pulse');
  };
  let style = twMerge('bg-loading animate-pulse', additionalClass);
</script>

<figure bind:this={figure} class={style}>
  <Image class={imgClass} {src} {alt} {width} {height} {transform} {crop} onload={removeBackground} />
</figure>
