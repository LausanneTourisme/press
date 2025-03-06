<script lang="ts">
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { Cloudinary, type Transform } from '$lib/cloudinary';
  import { filename } from '$lib/helpers';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import {dev} from "$app/environment"

  interface ImageProps {
    src: string;
    alt?: string;
    ignoreAutoSize?: boolean;
    height?: number;
    width?: number;
    crop?: boolean;
    transform?: Transform;
    class?: string;
    onload?: (event: Event) => unknown;
  }

  const {
    src,
    alt = '',
    ignoreAutoSize = false,
    height = undefined,
    width = undefined,
    crop = false,
    transform = {
      g: 'auto',
      c: 'fill'
    },
    class: additionalClass = '',
    onload
  }: ImageProps = $props();

  let style = twMerge('object-cover w-full h-full', additionalClass);
  let image: undefined|HTMLImageElement = $state(undefined);
  let srcResolved: string = $state('');

  const generateImagePath = () => {
    if(!image) {
      srcResolved = src;
      return;
    }

    let resolution: { width?: number; height?: number } = {};

    if ((!height || !width) && !ignoreAutoSize) {
      let { w, h } = {
        w: image.getBoundingClientRect().width,
        h: image.getBoundingClientRect().height
      };

      resolution.width = Math.round(w);
      if (crop && !height) {
        resolution.height = Math.round(h);
      }
    }
    if (width) {
      resolution.width = width;
    }
    if (height) {
      resolution.height = height;
    }

    // filter locally-called images from API images with a cloudinary ID (that don't have "images" in their name)
    if (!dev && src.match(/(?=images)|(?=lib)/g)?.length && !src.includes('http')) {
      srcResolved = Cloudinary.make(`${PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${filename(src)}`).url({
        ...resolution,
        ...transform
      });
    } else {
      srcResolved = src;
    }
  };

  onMount(generateImagePath);
</script>

{#key srcResolved}
  <img
    bind:this={image}
    src={srcResolved}
    {alt}
    title={alt}
    loading="lazy"
    class={style}
    {onload}
  />
{/key}
