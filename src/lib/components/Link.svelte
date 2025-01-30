<script lang="ts">
  import { blankable } from '$lib/helpers';
  import { ChevronRight } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface LinkProps {
    href: string;
    preload?: true | '' | 'hover' | 'tap' | 'off';
    withIcon?: boolean;
    class?: string;
    classIcon?: string;
    children: Snippet;
    icon?: Snippet;
  }

  const {
    href,
    preload = 'hover',
    withIcon = true,
    class: additionalClass,
    classIcon,
    children,
    icon
  }: LinkProps = $props();
  let target: string | undefined = blankable(href);

  let style = twMerge(
    'flex justify-center items-center text-center transition-all font-medium',
    'hover:opacity-75',
    additionalClass
  );
  let iconStyle = twMerge('h-4 w-4 inline ml-2 ', classIcon);
</script>

<a {href} {target} class={style} data-sveltekit-preload-data={preload}>
  {@render children()}
  {#if withIcon}
    {#if !icon}
      <ChevronRight strokeWidth={3} class={iconStyle} />      
    {:else}
      {@render icon()}
    {/if}
  {/if}
</a>
