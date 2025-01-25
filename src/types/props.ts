import type { Snippet } from 'svelte';

export interface ButtonProps {
  tag?: "a"|"button",
  negative?: boolean,
  inline?: boolean,
  disabled?: boolean,
  href?: string,
  border?: boolean,
  nofx?: boolean,
  class?: string,
  onclick?: ((event: Event) => unknown),
  children: Snippet
  prefix?: Snippet
  suffix?: Snippet
}