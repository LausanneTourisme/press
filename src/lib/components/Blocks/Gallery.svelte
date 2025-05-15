<script lang="ts">
  import { Cloudinary } from '$lib/cloudinary';
  import { maxMobileWidth } from '$lib/helpers';
  import { locale, type Locale } from '$lib/translations';
  import type { Media, Translatable } from '$types';
  import { onMount } from 'svelte';
  import Figure from '../Figure.svelte';

  type HeadingProps = {
    class?: string;
    images: Media<Translatable>[];
  };

  const { class: additionalClass = '', images }: HeadingProps = $props();
  let isMobile = $state(false);

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };

  onMount(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  });
</script>

<!-- Image is a Media type -->
{#if images.length % 2 === 0}
  <!-- Block is even: simple grid-->
  <section class="my-6 grid auto-rows-auto grid-cols-2 gap-4">
    {#each images as image}
      <Figure
        useCloudinaryPreset={false}
        class="h-64"
        src={image?.cloudinary_id}
        transform={{
          h: isMobile ? 440 : 800,
          g: 'auto',
          c: 'fill'
        }}
        alt={`${image?.public_name?.[$locale as Locale]} - ${image?.copyright}`}
      />
    {/each}
  </section>
{:else if images.length === 3}
  <section class="my-6 grid max-h-[550px] grid-cols-2 grid-rows-2 gap-4">
    <div class="row-span-2">
      <Figure
        useCloudinaryPreset={false}
        class="h-full"
        src={images[0]?.cloudinary_id}
        transform={{
          h: isMobile ? 440 : 800,
          g: 'auto',
          c: 'fill'
        }}
        alt={`${images[0]?.public_name?.[$locale as Locale]} - ${images[0]?.copyright}`}
      />
    </div>
    <div>
      <Figure
        useCloudinaryPreset={false}
        class="h-full"
        src={images[1]?.cloudinary_id}
        transform={{
          h: isMobile ? 340 : 500,
          g: 'auto',
          c: 'fill'
        }}
        alt={`${images[1]?.public_name?.[$locale as Locale]} - ${images[1]?.copyright}`}
      />
    </div>
    <div class="col-start-2 row-start-2">
      <Figure
        useCloudinaryPreset={false}
        class="h-full"
        src={images[2]?.cloudinary_id}
        transform={{
          h: isMobile ? 340 : 500,
          g: 'auto',
          c: 'fill'
        }}
        alt={`${images[2]?.public_name?.[$locale as Locale]} - ${images[2]?.copyright}`}
      />
    </div>
  </section>
{/if}
