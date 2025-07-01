<!-- Used only for post content -->
<script lang="ts">
  import type { Metadata, Translatable } from '$types';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import HorizontalImage from './images/Horizontal.svelte';
  import Parallax from './images/Parallax.svelte';
  import SquareImage from './images/Square.svelte';
  import VerticalImage from './images/Vertical.svelte';

  type Props = {
    class?: string;
    parallaxClass?: string,
    cloudinaryId: string;
    alt: string;
    size: 'small' | 'medium' | 'large' | 'parallax';
    focus?: 'face' | 'auto' | 'null';
    fixed?: boolean;
    metadata?: Metadata<Translatable>;
    children?: Snippet;
  };

  const {
    class: additionalClass = '',
    parallaxClass,
    cloudinaryId,
    alt,
    size,
    metadata,
    children,
    focus = 'auto',
    fixed = true
  }: Props = $props();
  let parallaxWidth: number = $state(0);

  const getImgType = (
    width: number | undefined,
    height: number | undefined
  ): 'vertical' | 'horizontal' | 'square' => {
    if (!height || !width) {
      return 'horizontal';
    }

    if (height > width) {
      return 'vertical';
    } else if (width > height) {
      return 'horizontal';
    } else {
      return 'square';
    }
  };

  const getFocus = (): 'face' | 'auto' => {
    if (!focus || focus === 'null') {
      return 'auto';
    }

    return focus;
  };

  const updateWidth = () => {
    parallaxWidth = window.innerWidth;
  };

  const style = twMerge('min-h-96', additionalClass);
  const imgFormat: 'vertical' | 'horizontal' | 'square' = $derived(
    metadata ? getImgType(metadata?.width, metadata?.height) : 'horizontal'
  );

  onMount(() => {
    updateWidth();
    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);

    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('orientationchange', updateWidth);
    };
  });
</script>

{#if size === 'parallax'}
  <div bind:clientWidth={parallaxWidth}>
    <Parallax
        class={twMerge(!fixed ? 'pt-0' : '')}
        imageClass={twMerge(style, parallaxClass)}
        width={parallaxWidth}
        focus={getFocus()}
        {cloudinaryId}
        {fixed}
        {size}
        >
        {#if children}
          {@render children()}
        {/if}
    </Parallax>
  </div>
{:else if imgFormat === 'vertical'}
  <VerticalImage class="vertical-image" focus={getFocus()} {size} {alt} {cloudinaryId}  />
{:else if imgFormat === 'horizontal'}
  <HorizontalImage class="hotizontal-image" focus={getFocus()} {size} {alt} {cloudinaryId}  />
{:else}
  <SquareImage class="sqaure-image" focus={getFocus()} {size} {alt} {cloudinaryId}  />
{/if}
