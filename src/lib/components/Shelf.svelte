<script lang="ts">
  import { ChevronDown } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import { slide } from 'svelte/transition';

  type Props = {
    class?: string;
    titleClass?: string;
    childClass?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: Snippet;
    title: string | Snippet;
  };

  const { class: additionalClass, children, title, titleClass, childClass, isOpen, onToggle }: Props = $props();
  const style = twMerge(additionalClass);
</script>

<div class={style}>
  <button
    class={twMerge('flex w-full cursor-pointer justify-between pr-1 font-semibold', titleClass)}
    onclick={onToggle}
  >
    {#if typeof title === 'function'}
      {@render title()}
    {:else}
      <span>{title}</span>
    {/if}
    <span
      class="inline-flex items-center justify-center transition-transform duration-300"
      class:rotate-180={isOpen}
    >
      <ChevronDown strokeWidth={3} class="inline h-4 w-4" />
    </span>
  </button>

  {#if isOpen}
    <div transition:slide class={twMerge("space-y-2", childClass)}>
      {@render children()}
    </div>
  {/if}
</div>
