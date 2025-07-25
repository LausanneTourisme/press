<script lang="ts">
  import { dev } from '$app/environment';
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET } from '$env/static/public';
  import { filename, isOfflineMode } from '$lib/helpers';
  import { CircleX, Pause, Play, Volume2 } from 'lucide-svelte';
  import { onMount, type Snippet } from 'svelte';
  import Device from 'svelte-device-info';
  import { twMerge } from 'tailwind-merge';

  type VideoProps = {
    src: string;
    class?: string;
    useCloudinaryPreset?: boolean;
    useCloudinary?: boolean;
    preload?: '' | 'auto' | 'metadata' | 'none' | null | undefined;
    muted?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    controls?: boolean;
    children?: Snippet;
  };

  let video: HTMLVideoElement | null | undefined;
  let playing: boolean = $state(false);

  let {
    class: additionalClass,
    src,
    useCloudinaryPreset = true,
    useCloudinary = true,
    muted = false,
    autoplay = false,
    loop = false,
    controls = false,
    preload = 'auto',
    children
  }: VideoProps = $props();

  const videoSource = $derived.by(() => {
    if (!useCloudinary || (dev && isOfflineMode)) {
      return src;
    }
    //replace any video format by optimized format
    const videoExtensions = [
      'mp4',
      'avi',
      'mov',
      // 'mkv', // because MKV is a container that could contain subs
      'webm',
      'flv',
      'wmv',
      'mpeg',
      'mpg',
      '3gp',
      'm4v',
      'ts',
      'ogv'
    ];
    const videoRegex = new RegExp(`\\.(${videoExtensions.join('|')})$`, 'i');
    let path = src.replace(videoRegex, '.webm');
    path = path.startsWith('/') ? path : `/${path}`;
    return `https://static.lausanne-tourisme.ch/video/upload/w_1920/${useCloudinaryPreset ? PUBLIC_CLOUDINARY_UPLOAD_PRESET : ''}${path}`;
  });

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

  const mute = () => {
    muted = !muted;
  };

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
    src={videoSource}
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
