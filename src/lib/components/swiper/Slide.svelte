<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
    children: Snippet;
  };

  const { class: additionalClass = "w-min!", children }: Props = $props();
</script>

<div class={twMerge('swiper-slide', additionalClass)}>
  {@render children?.()}
</div>
