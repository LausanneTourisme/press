<script lang="ts">
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import { maxMobileWidth } from '$lib/helpers';
  import { generateCloudinaryUrl, selectBestWidth } from '$lib/helpers/image';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    imageClass?: string;
    cloudinaryId: string;
    width: number;
    fixed?: boolean;
    size: 'small' | 'medium' | 'large' | 'parallax';
    focus?: 'face' | 'auto';
    children?: Snippet;
  };

  const {
    class: additionalClass = '',
    imageClass,
    cloudinaryId,
    fixed = false,
    width,
    focus = 'auto',
    children
  }: Props = $props();

  const updateUrl = () => {
    let finalWidth = 1920;
    if (width) {
      finalWidth = width < maxMobileWidth ? width : Math.round(width / 1.4);
    }

    return generateCloudinaryUrl({
      src: cloudinaryId,
      usePreset: false,
      transform: {
        width: selectBestWidth(finalWidth),
        ar: '4:5',
        gravity: focus,
        crop: 'fill'
      }
    });
  }

  let url = $derived.by(updateUrl);
  
  const update = () => {
    url = updateUrl();
  };

  onMount(() => {
    update();
    window.addEventListener('DOMContentLoaded', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('DOMContentLoaded', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  });
</script>

<Container fullscreen={true} class={twMerge('parallax-image relative py-10', additionalClass)}>
  <div
    style="background: url({url}) {fixed ? 'fixed' : ''} no-repeat center/cover"
    class={imageClass}
    class:shadow-inner={fixed}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
</Container>
