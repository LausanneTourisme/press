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

  let tagStyle: string;

  switch (tag) {
    case 'h1':
      tagStyle = 'text-5xl font-bold py-3';
      break;
    case 'h2':
      tagStyle = 'text-4xl font-semibold py-4';
      break;
    case 'h3':
      tagStyle = 'text-xl font-medium mb-2';
      break;
    case 'h4':
      tagStyle = 'text-lg font-medium mb-2';
      break;
    case 'h5':
      tagStyle = 'text-lg font-medium italic mb-2';
      break;
    default:
      tagStyle = 'mb-6';
  }

  const style = twMerge('dark:text-white text-black', tagStyle, additionalClass);
</script>

<svelte:element this={tag} class={style} {title}>
  {@render children()}
</svelte:element>
