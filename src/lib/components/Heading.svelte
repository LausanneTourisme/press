<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type HeadingProps = {
    class?: string;
    tag?: string;
    title?: string;
    children: Snippet;
  };

  let { class: additionalClass = '', tag = 'h2', title = '', children }: HeadingProps = $props();

  let tagStyle: string;

  switch (tag) {
    case 'h1':
      tagStyle = 'text-3xl md:text-[2.4rem] leading-tight tracking-[.45px] py-3';
      break;
    case 'h2':
      tagStyle = 'text-2xl md:text-[2.4rem] md:leading-tight tracking-[.45px] py-1';
      break;
    case 'h3':
      tagStyle = 'text-xl md:text-2xl leading-snug tracking-tight font-semibold -mb-2 mt-4';
      break;
    case 'h4':
      tagStyle = 'text-lg md:text-xl leading-snug tracking-tight font-medium -mb-2 mt-4';
      break;
    default:
      tagStyle = 'text-lg';
  }

  const style = twMerge('font-bold', tagStyle, additionalClass);
</script>

<svelte:element this={tag} class={style} {title}>
    {@render children()}
</svelte:element>
