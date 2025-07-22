<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_CLOUDINARY_CNAME, PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { isOfflineMode } from '$lib/helpers';
  import { generateCloudinaryUrl, transformToString } from '$lib/helpers/image';
  import type { CloudinarySize, Transform } from '$types';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    sizes?: string;
    srcset?: {
      usePreset?: boolean;
      transform: Transform;
      src: string;
      size: CloudinarySize;
    }[];
    transform?: Transform;
    useCloudinaryPreset?: boolean;
    src?: string;
    localSrc: string;
    title?: string;
    alt: string;
  };

  const {
    class: additionalClass = '',
    sizes,
    srcset,
    transform,
    useCloudinaryPreset = true,
    src,
    localSrc,
    title,
    alt
  }: Props = $props();

  // if localSrc use it in otherwise use src and if https = external link

  const srcFinal = $derived.by(() => {
    if (!src) {
      return localSrc;
    }

    //offline mode and double check for empty src
    if (dev && isOfflineMode) {
      if (src?.startsWith('http')) {
        return '/pages/themes/cathedrale_skate.jpg';
      }
      return localSrc;
    }

    return generateCloudinaryUrl({
      src,
      usePreset: useCloudinaryPreset,
      transform
    });
  });

  const srcSetFinal = $derived.by(() => {
    if ((dev && isOfflineMode) || !srcset) {
      return '';
    }
    if (srcset.length) {
      return srcset.map((s) => generateCloudinaryUrl(s)).join(',\n');
    }

    return '';
  });

  const style=twMerge(
    "object-cover h-full w-full",
    additionalClass
  )
</script>

<img class={style} {sizes} srcset={srcSetFinal} src={srcFinal} {alt} {title} />
