<script lang="ts">
  import { twMerge } from 'tailwind-merge';
  import { onMount, type Snippet } from 'svelte';
  import Image from './Media/Image.svelte';

  type Props = {
    children: Snippet;
    src: string;
    alt?: string;
    border?: string;
    background?: string;
    negative?: boolean;
    nofx?: boolean;
    class?: string;
  };

  const {
    children,
    class: additionalClass,
    src,
    alt,
    border,
    background,
    negative = false,
    nofx = false
  }: Props = $props();

  const cardStyle = twMerge(
    'card rounded-none',
    nofx ? 'nofx' : '',
    'min-w-[315px] w-[315px] md:w-[375px] h-[360px] md:h-[460px] relative md:ml-0',
    'group transition-all',
    'bg-gradient-to-b from-transparent to-zinc-950 hover:to-transparent',
    negative ? 'text-zinc-950' : 'text-white',
    background,
    additionalClass
  );
  const paragraphStyle = twMerge(
    'body flex flex-col justify-end relative z-0 p-6 pb-8 w-full h-full drop-shadow-md',
    border,
    negative ? 'text-zinc-950' : 'text-white',
    '[text-shadow:_0_0_7px_var(--tw-shadow-color)] shadow-zinc-950/80',
  );
</script>

<div class={cardStyle}>
  <div class="image pointer-events-none absolute top-0 left-0 h-full w-full">
    <Image {src} {alt} class="opacity-100 transition-all group-hover:opacity-100" />
  </div>
  <div
    class="to-shakespeare-950/80 pointer-events-none absolute top-0 left-0 h-full w-full bg-gradient-to-b from-transparent from-0% via-transparent via-40% to-100% transition-all group-hover:opacity-70"
  ></div>
  <div class={paragraphStyle}>
    {@render children()}
  </div>
</div>
