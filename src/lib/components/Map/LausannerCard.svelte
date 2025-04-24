<script lang="ts">
  import type { Favorite, Lausanner, Poi } from '$types';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Image from '../Media/Image.svelte';
  import { t } from '$lib/translations';
  import { PUBLIC_ENABLE_OFFLINE_MODE } from '$env/static/public';

  type Props = {
    class?: string;
    favorite: Favorite;
    onclick?: (options: { lausanner?: Lausanner; favorite: Favorite }) => void;
  };

  const {
    class: additionalClass,
    favorite,
    onclick,
  }: Props = $props();
  
  const poi: Poi|undefined = favorite.pois?.at(0);
  const lausanner = favorite.lausanner;
  const lausannerImage = PUBLIC_ENABLE_OFFLINE_MODE ? '/pages/themes/user_not_found.png' : lausanner?.medias?.find(() => true)?.cloudinary_id ?? '/pages/themes/user_not_found.png'
</script>

<button
  onclick={() => onclick?.({ favorite, lausanner })}
  class={twMerge("my-4 mt-0 flex h-48 w-full items-center overflow-hidden border-t-4 bg-white text-left shadow md:border-t-0 md:border-r-4 rounded", additionalClass)}
  transition:fade
>
  <figure class="h-full w-1/3 xl:w-[160px]">
    <Image
      src={lausannerImage}
      transform={{ gravity: 'north', c: 'auto', h: 200 }}
      alt={lausanner?.name?.replace(/,.+/gi, '')}
    />
    <figcaption class="hidden">{lausanner?.name?.replace(/,.+/gi, '')}</figcaption>
  </figure>
  <article class="w-3/5 p-4">
    <p class="mb-2 font-bold">
      {$t('common.poi.favorite.from', {
          poi: poi?.name as string|undefined,
          lausanner: lausanner?.name?.replace(/,.+/gi, ''),
      })}
    </p>
    <p class="md:text-default line-clamp-3 text-sm">
      {favorite.content}
    </p>
    <div class="md:text-default py-2 text-sm underline">
      {$t('common.btn.learnMore')}
    </div>
  </article>
</button>
