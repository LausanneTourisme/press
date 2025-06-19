<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type HeadingProps = {
    class?: string;
    centered?: boolean;
    children: Snippet;
  };

  const { class: additionalClass = '', children }: HeadingProps = $props();

  const style = twMerge(
    'paragraph leading-8 tracking-[0.45px]',
    additionalClass
  );
</script>

<p class={style}>
  {@render children()}
</p>
