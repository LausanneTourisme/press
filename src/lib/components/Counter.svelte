<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    animate: boolean;
    icon: Snippet;
    label: string;
    value: number;
    duration?: number; // seconds
    step?: number;
    class?: string;
  };

  const {
    class: additionalClass,
    animate,
    icon,
    label,
    value,
    duration = 150,
    step = value / duration
  }: Props = $props();

  let span: HTMLSpanElement;
  let playing: boolean = $state(false);
  let animatedResult: number = $state(0);
  let done = $state(false);
  let timing: number = duration / value / 1000;

  const formatNumber = (input: number, format: boolean = true) => {
    if (format) {
      return Math.round(input).toLocaleString();
    }

    return input;
  };

  const play = () => {
    span.classList.add('font-mono', 'bold');

    if (!playing) {
      let intervalId = setInterval(() => {
        if (animatedResult <= value) {
          animatedResult += step;
        } else {
          span?.classList.remove('font-mono', 'bold');
          clearInterval(intervalId);
          done = true;
          animatedResult = value;
        }
      }, timing);
    } else {
      span.classList.remove('font-mono', 'bold');
    }

    playing = true;

    return !done;
  };

  $effect(() => {
    if (animate) play();
  });
  const style = twMerge('stat place-items-center border-none xl:px-2 !border-none', additionalClass);
</script>

<div class={style}>
  <div class="py-2">
    {@render icon()}
  </div>
  <div class="stat-value xl:text-2xl 2xl:text-4xl">
    <span
      bind:this={span}
      class="animated-element inline-block w-40 text-center font-mono transition-[filter]"
    >
      {formatNumber(animatedResult)}
    </span>
  </div>
  <p class="stat-title !text-base max-w-48 text-center text-wrap break-words">{label}</p>
</div>
