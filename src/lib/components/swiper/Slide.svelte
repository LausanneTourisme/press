<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    children: Snippet;
  };

  const { class: additionalClass, children }: Props = $props();
</script>

<div class={twMerge('swiper-slide w-min!', additionalClass)}>
  {@render children?.()}
</div>
