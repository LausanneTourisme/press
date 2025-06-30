<script lang="ts">
  import { type Transform } from '$lib/cloudinary';
  import { twMerge } from 'tailwind-merge';
  import Image from './Media/Image.svelte';

  interface Props {
    src?: string;
    useCloudinaryPreset?: boolean;
    alt?: string;
    transform?: Transform;
    crop?: boolean;
    width?: number;
    height?: number;
    class?: string;
    imgClass?: string;
    ignoreAutoSize?:boolean
    onclick?: (event: unknown) => void;
  }

  const {
    class: additionalClass,
    imgClass,
    src = '',
    useCloudinaryPreset = true,
    alt = '',
    transform,
    crop = true,
    width = 0,
    height = 0,
    ignoreAutoSize,
    onclick
  }: Props = $props();

  let figure: HTMLElement | undefined = $state();

  const removeBackground = () => {
    figure?.classList.remove('bg-loading', 'animate-pulse');
  };
  let style = twMerge('bg-loading animate-pulse', additionalClass);
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if onclick}
  <button {onclick}>
    <figure bind:this={figure} class={style} {onclick}>
      <Image
        class={imgClass}
        {useCloudinaryPreset}
        {src}
        {alt}
        {width}
        {height}
        {transform}
        {crop}
        onload={removeBackground}
      />
    </figure>
  </button>
{:else}
  <figure bind:this={figure} class={style} {onclick}>
    <Image
      class={imgClass}
      {useCloudinaryPreset}
      {src}
      {alt}
      {width}
      {height}
      {transform}
      {crop}
      onload={removeBackground}
      {ignoreAutoSize}
    />
  </figure>
{/if}
