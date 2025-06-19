<script lang="ts">
  import { blankable } from '$lib/helpers';
  import { ChevronRight } from 'lucide-svelte';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface LinkProps {
    href: string;
    preload?: true | '' | 'hover' | 'tap' | 'off';
    noscroll?: boolean;
    withIcon?: boolean;
    class?: string;
    classIcon?: string;
    withFlex?: boolean;
    children: Snippet;
    icon?: Snippet;
    onclick?: (this: Window, ev: MouseEvent) => any;
  }

  const {
    href,
    preload = 'hover',
    noscroll = true,
    withIcon = true,
    withFlex = true,
    class: additionalClass,
    classIcon,
    children,
    icon,
    onclick,
  }: LinkProps = $props();
  const target: string | undefined = blankable(href);

  const style = twMerge(
    withFlex ? 'flex justify-center items-center' : '',
    'text-center transition-all font-medium',
    'hover:opacity-75',
    additionalClass
  );
  const iconStyle = twMerge('h-4 w-4 inline ml-2 ', classIcon);
</script>

<a {href} {target} class={style} data-sveltekit-noscroll={noscroll} data-sveltekit-preload-data={preload} {onclick}>
  {@render children()}
  {#if withIcon}
    {#if !icon}
      <ChevronRight strokeWidth={3} class={iconStyle} />
    {:else}
      {@render icon()}
    {/if}
  {/if}
</a>
