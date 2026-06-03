<script lang="ts">
  import { resolve } from '$app/paths';
  import type { Pathname } from '$app/types';
  import { blankable } from '$lib/helpers';
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    href: string;
    title?: string;
    preload?: true | '' | 'hover' | 'tap' | 'off';
    overflow?: boolean;
    class?: string;
    children: Snippet;
    onclick?: (this: Window, ev: MouseEvent) => unknown;
  }

  const {
    class: additionalClass,
    href,
    preload = 'tap',
    overflow = false,
    title,
    children,
    onclick
  }: Props = $props();
  let target: string | undefined = $derived(blankable(href));

  let style = $derived(
    twMerge(
      'block group/clickable cursor-pointer',
      !overflow ? 'overflow-hidden' : '',
      additionalClass
    )
  );
</script>

{#if href === '#' || target === '_blank'}
  <a
    {href}
    rel="external"
    {target}
    class={style}
    data-sveltekit-preload-data={preload}
    {title}
    {onclick}
    transition:fade
  >
    {@render children()}
  </a>
{:else}
  <a
    href={resolve(href as Pathname)}
    rel="internal"
    {target}
    class={style}
    data-sveltekit-preload-data={preload}
    {title}
    {onclick}
    transition:fade
  >
    {@render children()}
  </a>
{/if}
