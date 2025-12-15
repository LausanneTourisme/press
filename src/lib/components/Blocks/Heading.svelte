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

  let tagStyle = $derived.by( () => {
    switch (tag) {
      case 'h1':
        return 'text-5xl font-bold py-3';
      case 'h2':
        return 'text-4xl font-semibold py-4';
      case 'h3':
        return 'text-xl font-medium mb-2';
      case 'h4':
        return 'text-lg font-medium mb-2';
      case 'h5':
        return 'text-lg font-medium italic mb-2';
      default:
        return 'mb-6';
    }
  });


  const style = $derived(twMerge('dark:text-white text-black', tagStyle, additionalClass));
</script>

<svelte:element this={tag} class={style} {title}>
  {@render children()}
</svelte:element>
