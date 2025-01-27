<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import type { Snippet } from 'svelte';
  import { preventDefault } from '$lib/helpers/events';
  import { blankable } from '$lib/helpers';

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
    'group cursor-pointer py-2 my-2 transition-all text-center font-medium overflow-hidden rounded',
    !border ? 'border-0' : 'border-2',
    !inline ? 'inline-block' : 'inline',
    !negative ? 'text-gray-950 border-gray-700' : 'text-white border-gray-200',
    !nofx
      ? !negative
        ? 'hover:bg-gray-950 hover:text-white shadow-white'
        : 'hover:bg-white hover:text-gray-950 shadow-gray-950'
      : '',
    !nofx ? 'px-8 hover:rounded hover:border-transparent hover:shadow-lg' : 'px-0 hover:opacity-75',
    additionalClass
  );

  // If href is provided, the default behavior (navigation) should be preserved
  const handleClick = (event: Event) => {
    if (href && !onclick) {
      return; // Let the default anchor behavior proceed
    }
    preventDefault(onclick)?.(event); // Otherwise, handle the custom onclick with preventDefault
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element this={tag} class={style} {href} {target} {disabled} onclick={handleClick}>
  {@render prefix?.()}
  {@render children()}
  {@render suffix?.()}
</svelte:element>
