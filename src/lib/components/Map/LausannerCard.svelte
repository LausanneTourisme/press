<script lang="ts">
  import { isOfflineMode } from '$lib/helpers';
  import { t } from '$lib/translations';
  import type { Favorite, Lausanner, Poi } from '$types';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Image from '../Media/Image.svelte';

  type Props = {
    class?: string;
    favorite: Favorite<string>;
    lausanner?: Lausanner<string>;
    poi: Poi<string>;
    onclick?: (options: { lausanner?: Lausanner<string>; favorite: Favorite<string>; poi: Poi<string> }) => void;
  };

  const { class: additionalClass, favorite, lausanner, poi, onclick }: Props = $props();

  const defaultImage = '/pages/themes/user_not_found.png';
  const lausannerImage = isOfflineMode
    ? '/pages/themes/user_not_found.png'
    : lausanner?.medias?.find(() => true)?.cloudinary_id;
</script>

<button
  onclick={() => onclick?.({ favorite, lausanner, poi })}
  class={twMerge(
    'my-4 mt-0 flex h-48 w-full items-center overflow-hidden rounded border-t-4 bg-white text-left shadow md:border-t-0 md:border-r-4',
    additionalClass
  )}
  transition:fade
>
  <figure class="h-full w-1/3 xl:w-[160px]">
    <Image
      src={lausannerImage ?? defaultImage}
      useCloudinaryPreset={lausannerImage ? false : true}
      ignoreAutoSize={false}
      transform={{ gravity: 'auto', c: 'auto' }}
      alt={lausanner?.name?.replace(/,.+/gi, '')}
    />
    <figcaption class="hidden">{lausanner?.name?.replace(/,.+/gi, '')}</figcaption>
  </figure>
  <article class="w-3/5 p-4">
    <p class="mb-2 font-bold">
      {$t('common.poi.favorite.from', {
        poi: poi.name as string | undefined,
        lausanner: lausanner?.name?.replace(/,.+/gi, '')
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
