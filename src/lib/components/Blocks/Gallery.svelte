<script lang="ts">
  import { maxMobileWidth } from '$lib/helpers';
  import { type Locale } from '$lib/translations';
  import type { Media } from '$types';
  import { onMount } from 'svelte';
  import Figure from '../Figure.svelte';

  type HeadingProps = {
    class?: string;
    images: Media<string>[];
    locale: Locale;
  };

  const { images }: HeadingProps = $props();
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
    {#each images as image (image.cloudinary_id)}
      <Figure
        useCloudinaryPreset={false}
        class="h-64"
        src={image?.cloudinary_id}
        transform={{
          height: isMobile ? 440 : 800,
          gravity: 'auto',
          crop: 'fill'
        }}
        alt={`${image?.public_name} - ${image?.copyright}`}
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
          height: isMobile ? 440 : 800,
          gravity: 'auto',
          crop: 'fill'
        }}
        alt={`${images[0]?.public_name} - ${images[0]?.copyright}`}
      />
    </div>
    <div>
      <Figure
        useCloudinaryPreset={false}
        class="h-full"
        src={images[1]?.cloudinary_id}
        transform={{
          height: isMobile ? 340 : 500,
          gravity: 'auto',
          crop: 'fill'
        }}
        alt={`${images[1]?.public_name} - ${images[1]?.copyright}`}
      />
    </div>
    <div class="col-start-2 row-start-2">
      <Figure
        useCloudinaryPreset={false}
        class="h-full"
        src={images[2]?.cloudinary_id}
        transform={{
          height: isMobile ? 340 : 500,
          gravity: 'auto',
          crop: 'fill'
        }}
        alt={`${images[2]?.public_name} - ${images[2]?.copyright}`}
      />
    </div>
  </section>
{/if}
