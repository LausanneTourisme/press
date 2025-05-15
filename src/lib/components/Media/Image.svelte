<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { Cloudinary, type Transform } from '$lib/cloudinary';
  import { filename } from '$lib/helpers';
  import { twMerge } from 'tailwind-merge';

  interface ImageProps {
    src: string;
    useCloudinaryPreset?: boolean,
    title?: string;
    alt?: string;
    ignoreAutoSize?: boolean;
    height?: number;
    width?: number;
    crop?: boolean;
    transform?: Transform;
    class?: string;
    onload?: (event: Event) => unknown;
  }

  let {
    src,
    useCloudinaryPreset = true,
    title,
    alt = '',
    ignoreAutoSize = true,
    height = undefined,
    width = undefined,
    crop = false,
    transform,
    class: additionalClass = '',
    onload
  }: ImageProps = $props();

  if(!transform){
    transform = {
      g: 'auto',
      c: 'fill'
    };
  }
  let style = twMerge('object-cover w-full h-full', additionalClass);
  let image: undefined | HTMLImageElement = $state(undefined);
  let srcResolved: string = $state('');

  const generateImagePath = () => {
    if (!image) {
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
    if ((!dev && !src.includes('http')) || !src.startsWith('/images')) {
      const path = useCloudinaryPreset ? `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${filename(src)}` : filename(src);
      srcResolved = Cloudinary.make(path).url({
        ...resolution,
        ...transform
      });
    } else {
      srcResolved = src.startsWith('/') ? src : `/${src}`;
    }
  };

  $effect(generateImagePath);
</script>

{#key srcResolved}
  <img
    bind:this={image}
    src={srcResolved}
    {alt}
    title={title ?? alt}
    loading="lazy"
    class={style}
    {onload}
  />
{/key}
