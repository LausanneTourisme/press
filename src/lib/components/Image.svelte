<script lang="ts">
  import { dev } from '$app/environment';
  import { isOfflineMode } from '$lib/helpers';
  import { generateCloudinaryUrl } from '$lib/helpers/image';
  import type { Transform } from '$types';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    srcset?: {
      isLocal?: boolean;
      usePreset?: boolean;
      transform?: Transform;
      src: string;
      size: number;
    }[];
    transform?: Transform;
    useCloudinaryPreset?: boolean;
    src?: string;
    localSrc: string;
    title?: string;
    alt: string;
    onload?: (event: Event) => unknown;
  };

  const {
    class: additionalClass = '',
    srcset,
    transform,
    useCloudinaryPreset = true,
    src,
    localSrc,
    title,
    alt,
    onload
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
      return [];
    }
    if (srcset.length) {
      return srcset.map((s) => {
        if (s.isLocal) {
          return { size: s.size, src: `${s.src}` }; // ${s.size}
        }
        return { size: s.size, src: generateCloudinaryUrl(s)};
      });
    }

    return [];
  });

  const style = twMerge('flex object-cover h-full w-full', additionalClass);
</script>

<!-- <img class={style} {sizes} srcset={srcSetFinal} src={srcFinal} {alt} {title} /> -->
<picture class={style}>
  {#each srcSetFinal.reverse() as srcSet}
    <source media="(width >= {srcSet.size}px)" srcset={srcSet.src} />
  {/each}
  <img class="w-full h-auto object-cover" src={srcFinal} {alt} {title} {onload} />
</picture>
