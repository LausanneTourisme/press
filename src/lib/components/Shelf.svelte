<script lang="ts">
    import { ChevronDown } from 'lucide-svelte';
    import type { Snippet } from 'svelte';
    import { twMerge } from 'tailwind-merge';
    import { slide } from 'svelte/transition';

    type Props = {
      class?: string;
      titleClass?: string;
      isOpen: boolean;
      onToggle: () => void;
      children: Snippet;
      title: string;
    };

    const { class: additionalClass, children, title, titleClass, isOpen, onToggle }: Props = $props();
    const style = twMerge(additionalClass);
  </script>

  <div class={style}>
    <button
      class={twMerge("cursor-pointer font-semibold flex justify-between pr-1 w-full", titleClass)}
      onclick={onToggle}
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
