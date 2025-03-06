<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  type Props = {
    class?: string;
    children: Snippet<[{ intersecting: boolean }]>;
    intersecting?: boolean;
    threshold?: number;
    rootMargin?: string;
    onIntersecting?: () => void;
  };

  let {
    class: additionalClass,
    children,
    intersecting = false,
    threshold = 0.5,
    rootMargin = '0px',
    onIntersecting = () => {}
  }: Props = $props();

  let div: HTMLElement;
  let observer: IntersectionObserver | null = null;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries, observer) => {
        intersecting = entries[0].isIntersecting;
        onIntersecting();
      },
      {
        root: div,
        rootMargin,
        threshold
      }
    );

    observer.observe(div);
  });
</script>

<div bind:this={div}>
  {@render children({ intersecting })}
</div>
