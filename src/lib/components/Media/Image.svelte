<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { Cloudinary, type Transform } from '$lib/cloudinary';
  import { filename, isOfflineMode, resizeWithAspectRatio } from '$lib/helpers';
  import { onMount } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    src: string;
    inCloudinary?: boolean;
    useCloudinaryPreset?: boolean;
    title?: string;
    alt?: string;
    ignoreAutoSize?: boolean;
    crop?: boolean;
    transform?: Transform;
    class?: string;
    onload?: (event: Event) => unknown;
  };

  const {
    src,
    inCloudinary = true,
    useCloudinaryPreset = true,
    title,
    alt = '',
    ignoreAutoSize = true,
    crop = false,
    transform: userTransform,
    class: additionalClass = '',
    onload
  }: Props = $props();

  const style = twMerge('object-cover w-full h-full', additionalClass);
  let image: undefined | HTMLImageElement = $state(undefined);
  let srcResolved: string = $state('');

  const generateImagePath = () => {
    if (isOfflineMode) {
      if (src.startsWith('http') && inCloudinary) {
        srcResolved = '/pages/themes/cathedrale_skate.jpg';
        return;
      }
      srcResolved = src.startsWith('/') ? src : `/${src}`;
      return;
    }
    if (src.startsWith('http') || !inCloudinary) {
      srcResolved = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;
      return;
    }

    // Cloudinary section
    let transform: Transform = {
      gravity: 'auto',
      crop: 'fill',
      ...userTransform,
    };

    const imageBoundaries = image?.getBoundingClientRect();

    if (!ignoreAutoSize) {
      if (!imageBoundaries) {
        return;
      }
      const width = transform.w ?? transform.width ?? imageBoundaries.width;
      const height = transform.h ?? transform.height ?? imageBoundaries.height;

      //replace by img boundaries
      delete transform.w;
      delete transform.width;
      delete transform.h;
      delete transform.height;

      transform = {
        ...transform,
        ...resizeWithAspectRatio({
          original: {
            width: typeof width === 'string' ? parseInt(width) : width,
            height: typeof height === 'string' ? parseInt(height) : height
          },
          targetWidth: Cloudinary.breakpoints(imageBoundaries.width)
        })
      };
    } else {
      let height = transform.h || transform.height ? (transform.h ?? transform.height) : 'auto';
      let width = transform.w || transform.width ? (transform.w ?? transform.width) : 'auto';

      delete transform.w;
      delete transform.width;
      delete transform.h;
      delete transform.height;

      if (width === 'auto' && height === 'auto' && !imageBoundaries) {
        height = 720;
        width = 1280;
      }

      transform = {
        ...transform,
        width,
        height
      };
    }

    const path = useCloudinaryPreset
      ? `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}${filename(src)}`
      : filename(src);

    srcResolved = Cloudinary.make(path).url(transform);
  };

  onMount(() => {
    generateImagePath();
    if (!ignoreAutoSize) {
      window.addEventListener('resize', generateImagePath);
    }
  });
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
