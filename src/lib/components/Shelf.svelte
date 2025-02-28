<script lang="ts">
    import { ChevronDown } from 'lucide-svelte';
    import type { Snippet } from 'svelte';
    import { twMerge } from 'tailwind-merge';
    import { slide } from 'svelte/transition';

    type Props = {
      class?: string;
      titleClass?: string;
      children: Snippet;
      title: string;
    };

    const { class: additionalClass, children, title, titleClass }: Props = $props();
    let isOpen = $state(false);
    const style = twMerge(additionalClass);

    const toggle = () => {
      isOpen = !isOpen;
    };
  </script>

  <div class={style}>
    <button
      class={twMerge("cursor-pointer font-semibold flex justify-between pr-1 w-full", titleClass)}
      onclick={toggle}
    >
      {title}
      <span
        class="inline-flex items-center justify-center transition-transform duration-300"
        class:rotate-180={isOpen}
      >
        <ChevronDown strokeWidth={3} class="inline h-4 w-4" />
      </span>
    </button>

    {#if isOpen}
      <div transition:slide class="mt-2 space-y-2">
        {@render children()}
      </div>
    {/if}
  </div>

