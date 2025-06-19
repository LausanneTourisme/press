<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type ContainerProps = {
    fullscreen?: boolean;
    width?: 'padded' | 'large' | 'medium' | 'small' | 'agenda';
    sticky?: boolean;
    background?: string;
    class?: string;
    children: Snippet;
  };

  const {
    fullscreen = false,
    width = 'large',
    sticky = false,
    background = '',
    class: additionalClass,
    children
  }: ContainerProps = $props();

  function getWidthStyle(width: string) {
    switch (width) {
      default:
      case 'padded':
        return 'mx-auto md:p-16 md:max-w-[1900px]';
      case 'large':
        return 'md:max-w-[1536px] mx-auto';
      case 'medium':
        return 'md:max-w-[1024px] mx-auto';
      case 'small':
        return 'md:max-w-[720px] mx-auto';
      case 'agenda':
        return 'md:px-16';
    }
  }
</script>

<!-- wrapping div to help with background colors and other...-->
<div class="w-full {background}">
  <section
    class={twMerge(
      !fullscreen ? `p-6 ${getWidthStyle(width)}` : 'max-w-screen overflow-hidden',
      sticky ? 'sticky top-24' : '',
      additionalClass
    )}
  >
    {@render children()}
  </section>
</div>
