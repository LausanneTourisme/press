<script lang="ts">
  import { blankable } from '$lib/helpers';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import { ChevronRightSolid } from 'flowbite-svelte-icons';

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
    withIcon = false,
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
  let iconStyle = twMerge('h-3 w-3 inline ml-2', classIcon);
</script>

<a {href} {target} class={style} data-sveltekit-preload-data={preload}>
  {@render children()}
  {#if withIcon}
    {#if !icon}
      <ChevronRightSolid class={iconStyle} />
    {:else}
      {@render icon()}
    {/if}
  {/if}
</a>
