<script lang="ts">
  import { type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  import Image from './Image.svelte';
  import { filename } from '$lib/helpers';

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
    'relative',
    'min-w-[220px] xs:min-w-[300px] md:min-w-[375px] w-full',
    'h-[460px]',
    'md:ml-0 group transition-all',
    negative ? 'text-zinc-950' : 'text-white',
    background,
    additionalClass
  );
  const paragraphStyle = twMerge(
    'relative drop-shadow-md',
    '[text-shadow:_0_0_7px_var(--tw-shadow-color)] shadow-zinc-950/80',
    'flex flex-col justify-end',
    'p-6 pb-8',
    'w-full h-full'
  );
</script>

<div class={cardStyle}>
  <div class="image pointer-events-none absolute top-0 left-0 h-full w-full">
    <Image alt={alt ?? ''} src={filename(src, false)} localSrc={src} />
  </div>
  <div
    class="to-shakespeare-950/80 pointer-events-none absolute top-0 left-0 h-full w-full bg-gradient-to-b from-transparent from-0% via-transparent via-40% to-100% transition-all group-hover:opacity-70"
  ></div>
  <div class={paragraphStyle}>
    {@render children()}
  </div>
</div>
