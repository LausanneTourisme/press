<script lang="ts">
  import { Play } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Observer from '../Observer.svelte';
  import Image from './Image.svelte';
  import Video from './Video.svelte';

  type Props = {
    class?: string;
    onIntersecting?: (isIntersecting: boolean) => void;
    src: string;
    poster: string;
    title?: string;
    autoplay?: boolean;
    controls?: boolean;
  };

  const {
    class: additionalClass,
    src,
    poster,
    title,
    autoplay = false,
    controls = false,
    onIntersecting
  }: Props = $props();

  let video: Video | undefined = $state(undefined);
  let posterElement: HTMLDivElement;
  let controlsElement: HTMLButtonElement;

  const launch = async () => {
    video?.toggleVideoState();

    if (video?.isRunning()) {
      posterElement.classList.add('-translate-y-full');
      controlsElement.classList.add('opacity-0');
      controlsElement.classList.remove('z-30');
    }
  };

  const style = twMerge('group relative h-full w-full overflow-hidden', additionalClass);
</script>

<article class={style} transition:fade={{ delay: 330 }}>
  <button
    class:hidden={autoplay}
    class="controls absolute top-0 left-0 z-30 flex h-full w-full cursor-pointer flex-col items-center justify-center text-white transition-opacity"
    bind:this={controlsElement}
    onclick={launch}
  >
    <p class="my-4 text-xl">{title}</p>
    <Play
      class="object-fit h-16 w-16 cursor-pointer rounded-full border-4 border-white p-2 text-white"
    />
  </button>
  <div
    class:hidden={autoplay}
    class="poster absolute top-0 left-0 z-20 h-full w-full bg-zinc-950 transition-transform"
    bind:this={posterElement}
  >
    <Image src={poster} alt="" class="opacity-50 transition-opacity group-hover:opacity-75" />
  </div>
  <Observer
    class="video h-full"
    onIntersecting={(isIntersecting) => {
      if (isIntersecting) {
        video?.play();
      } else {
        video?.pause(); // Optional: Pause video on exit
      }
      onIntersecting?.(isIntersecting); // Pass state up
    }}
  >
    <Video
      bind:this={video}
      autoplay={false}
      muted={true}
      loop={autoplay}
      {src}
      {controls}
      preload="metadata"
      class="relative z-0 xl:-mt-[10vw]"
    />
  </Observer>
</article>
