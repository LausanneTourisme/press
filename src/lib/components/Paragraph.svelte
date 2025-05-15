<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type HeadingProps = {
    class?: string;
    centered?: boolean;
    children: Snippet;
  };

  let { class: additionalClass = '', centered = false, children }: HeadingProps = $props();

  const style = twMerge(
    'dark:text-white text-neutral-700 font-lighter leading-7 my-3',
    centered ? 'md:text-center mx-auto max-w-[560px] md:max-w-[800px]' : '',
    additionalClass
  );
</script>

<p class={style}>
  {@render children()}
</p>
