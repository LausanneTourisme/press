<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  type Props = {
    name?: string;
    class?: string;
  };

  const { class: additionalClass, name }: Props = $props();
  const style = twMerge('relative -top-14 md:-top-32', additionalClass);
</script>

<div class={style}>
  <span id={name} class="absolute -z-50"></span>
</div>

<style>
  /**
     * Because the navbar is static, we want to offset its height to this span so it aligns perfectly.
    */
  span {
    height: 0;
    width: 0;
  }
</style>
