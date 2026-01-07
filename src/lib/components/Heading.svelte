<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type HeadingProps = {
    class?: string;
    tag?: `h${1 | 2 | 3 | 4 | 5 | 6}`;
    title?: string;
    children: Snippet;
  };

  const { class: additionalClass = '', tag = 'h2', title = '', children }: HeadingProps = $props();

  let tagStyle: string = $derived.by(() => {
    switch (tag) {
      case 'h1':
        return 'text-3xl md:text-[2.4rem] leading-tight tracking-[.45px] py-3';
      case 'h2':
        return 'text-2xl md:text-[2.4rem] md:leading-tight tracking-[.45px] py-1';
      case 'h3':
        return 'text-xl md:text-2xl leading-snug tracking-tight font-semibold -mb-2 mt-4';
      case 'h4':
        return 'text-lg md:text-xl leading-snug tracking-tight font-medium -mb-2 mt-4';
      default:
        return ' text-lg';
    }
  });

  const style = $derived(
    twMerge('dark:text-white text-black font-bold', tagStyle, additionalClass)
  );
</script>

<svelte:element this={tag} class={style} {title}>
  {@render children()}
</svelte:element>
