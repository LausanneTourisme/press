<script lang="ts">
  import { blankable } from '$lib/helpers';
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type ButtonProps = {
    tag?: 'a' | 'button';
    negative?: boolean;
    inline?: boolean;
    disabled?: boolean;
    href?: string;
    border?: boolean;
    nofx?: boolean;
    class?: string;
    onclick?: (event: Event) => unknown;
    children: Snippet;
    prefix?: Snippet;
    suffix?: Snippet;
  };

  let {
    tag = 'button',
    negative = false,
    inline = false,
    disabled = false,
    href = undefined,
    border = true,
    nofx = false,
    class: additionalClass = '',
    onclick = undefined,
    children,
    prefix = undefined,
    suffix = undefined
  }: ButtonProps = $props();

  let target: string | undefined = blankable(href);
  let style: string = twMerge(
    'shadow-none hover:shadow-gray-400 group cursor-pointer py-2 my-2 transition-all text-center font-medium overflow-hidden rounded-sm text-base-content',
    !border ? 'border-0' : 'border-2',
    !inline ? 'inline-block' : 'inline',
    !negative ? 'border-gray-700 text-black' : 'text-white border-gray-200',
    !nofx
      ? !negative
        ? 'hover:bg-neutral dark:hover:bg-zinc-700 hover:text-white shadow-base-100'
        : 'hover:bg-white hover:text-black '
      : '',
    !nofx
      ? 'px-8 hover:rounded-sm hover:border-transparent hover:shadow-sm'
      : 'px-0 hover:opacity-75',
    additionalClass
  );

  // If href is provided, the default behavior (navigation) should be preserved
  const handleClick = (event: Event) => {
    if (tag === 'button' && href) {
      return; // Let the default anchor behavior proceed
    }
    onclick?.(event); // Otherwise, handle the custom onclick with preventDefault
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element this={tag} class={style} {href} {target} {disabled} onclick={handleClick}>
  {@render prefix?.()}
  {@render children()}
  {@render suffix?.()}
</svelte:element>
