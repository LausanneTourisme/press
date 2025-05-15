<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { Cloudinary } from '$lib/cloudinary';
  import { filename } from '$lib/helpers';
  import { CircleX, Pause, Play, Volume2 } from 'lucide-svelte';
  import { onMount, type Snippet } from 'svelte';
  import Device from 'svelte-device-info';
  import { twMerge } from 'tailwind-merge';

  type VideoProps = {
    src: string;
    class?: string;
    preload?: '' | 'auto' | 'metadata' | 'none' | null | undefined;
    muted?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    children?: Snippet;
  };

  let video: HTMLVideoElement | null | undefined;
  let playing: boolean = $state(false);
  let srcResolved: string = $state('');

  let {
    class: additionalClass,
    src,
    muted = false,
    autoplay = false,
    loop = false,
    controls = false,
    preload = 'auto',
    children
  }: VideoProps = $props();

  export function toggleVideoState() {
    if (isRunning()) pause();
    else play();
  }

  export function play() {
    video?.play();
  }

  export function pause() {
    video?.pause();
  }

  export const isRunning = () => (video ? !video.paused : false);

  const refreshSrc = (filepath: string) => {
    if (video) {
      let { width } = video.getBoundingClientRect();

      width = Math.round(width);

      if (!dev && src.includes('videos')) {
        srcResolved = Cloudinary.make(
          `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${filename(filepath)}`
        ).url({
          width
        });
      } else {
        srcResolved = src;
      }
    }
  };

  const mute = () => {
    muted = !muted;
  };

  $effect(() => {
    refreshSrc(src);
  });

  const style = twMerge('w-full h-full relative z-0', additionalClass);
</script>

<div class="relative h-full w-full">
  <div class="absolute right-4 bottom-0 z-10 md:top-4">
    {#if !controls}
      <button class="cursor-pointer text-white shadow" onclick={mute}>
        <Volume2 class="absolute right-0 bottom-4 h-6 w-6 stroke-white" />
        <CircleX
          fill="text-brand-500"
          strokeWidth={0}
          class="{!muted
            ? 'opacity-0'
            : 'opacity-100'} text-brand-500 absolute right-0 bottom-4 h-6 w-6 transition-opacity"
        />
      </button>
      <button class="cursor-pointer text-white shadow" onclick={play}>
        <Play
          fill="text-brand-500"
          strokeWidth={0}
          class="{!playing
            ? 'opacity-0'
            : 'opacity-100'} absolute right-8 bottom-4 h-6 w-6 transition-opacity"
        />
        <Pause
          fill="text-brand-500"
          strokeWidth={0}
          class="{playing
            ? 'opacity-0'
            : 'opacity-100'} absolute right-8 bottom-4 h-6 w-6 transition-opacity"
        />
      </button>
    {/if}
  </div>
  <video
    bind:this={video}
    bind:paused={playing}
    src={srcResolved}
    {controls}
    {muted}
    {autoplay}
    {loop}
    {preload}
    class={style}
    onclick={Device.isMobile ? play : mute}
  >
    {#if children}
      {@render children()}
      <!-- Add <source> elements instead -->
    {/if}
  </video>
</div>
