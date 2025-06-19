<script lang="ts">
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    class?: string;
  };

  const { class: additionalClass }: Props = $props();
  const style = twMerge('loading loading-ring loading-lg', additionalClass);
</script>

<span class={style} out:fade></span>
