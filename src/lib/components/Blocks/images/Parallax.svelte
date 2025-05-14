<script lang="ts">
  import { Cloudinary } from '$lib/cloudinary';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import { maxMobileWidth } from '$lib/helpers';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    imageClass?: string;
    isMobile?: boolean;
    cloudinaryId: string;
    width: number;
    fixed?: boolean;
    size: 'small' | 'medium' | 'large' | 'parallax';
    focus?: 'face' | 'auto';
    children?: Snippet;
  };
  let isMobile = $state(false);

  const updateSize = () => {
    isMobile = width < maxMobileWidth;
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
  let url: string = $state('');

  onMount(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  });

  $effect(() => {
    url = Cloudinary.make(cloudinaryId).url({
      w: isMobile ? width : Math.round(width / 1.4),
      ar: '4:5',
      g: focus,
      c: 'fill'
    });
  });
</script>

<Container fullscreen={true} class={twMerge('py-10 relative', additionalClass)}>
  <div
    style="background: url({Cloudinary.make(cloudinaryId, 'image').url({
      width,
      g: focus,
      c: 'fill'
    })}) {fixed ? 'fixed' : ''} no-repeat center/cover"
    class={imageClass}
    class:shadow-inner={fixed}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>
</Container>
