<script lang="ts">
  import { type Transform } from '#lib/types';
  import { twMerge } from 'tailwind-merge';
  import Image from './Media/Image.svelte';
  import { filename } from '#lib/helpers';

  interface Props {
    src?: string;
    useCloudinaryPreset?: boolean;
    alt?: string;
    title?: string;
    transform?: Transform;
    class?: string;
    imgClass?: string;
    onclick?: (event: unknown) => void;
  }

  const {
    class: additionalClass,
    imgClass,
    src = '',
    useCloudinaryPreset = true,
    alt = '',
    title,
    transform,
    onclick
  }: Props = $props();

  let figure: HTMLElement | undefined = $state();

  const removeBackground = () => {
    figure?.classList.remove('bg-loading', 'animate-pulse');
  };
  let style = $derived(twMerge('bg-loading animate-pulse', additionalClass));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
{#if onclick}
  <button {onclick}>
    <figure bind:this={figure} class={style} {onclick}>
      <Image
        class={imgClass}
        {alt}
        {title}
        src={filename(src)}
        localSrc={src}
        {useCloudinaryPreset}
        {transform}
        onload={removeBackground}
      />
    </figure>
  </button>
{:else}
  <figure bind:this={figure} class={style} {onclick}>
    <Image
      class={imgClass}
      {alt}
      {title}
      src={filename(src)}
      localSrc={src}
      {useCloudinaryPreset}
      {transform}
      onload={removeBackground}
    />
  </figure>
{/if}
