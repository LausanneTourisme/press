<script lang="ts">
  import { blankable } from '$lib/helpers';
  import type { Snippet } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  interface Props {
    href: string;
    title?: string,
    preload?: true | '' | 'hover' | 'tap' | 'off';
    overflow?: boolean;
    class?: string;
    children: Snippet;
    onclick?: (this: Window, ev: MouseEvent) => any;
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
  let target: string | undefined = blankable(href);

  let style = twMerge(
    'block group/clickable cursor-pointer',
    !overflow ? 'overflow-hidden' : '',
    additionalClass
  );
</script>

<a {href} {target} class={style} data-sveltekit-preload-data={preload} {title} {onclick} transition:fade>
  {@render children()}
</a>
