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

  const {
    class: additionalClass,
    children,
    intersecting = false,
    threshold = 0.5,
    rootMargin = '0px',
    onIntersecting = () => {}
  }: Props = $props();

  let isIntersecting = $state(intersecting);
  let div: HTMLElement;
  let observer: IntersectionObserver | null = null;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries, observer) => {
        isIntersecting = entries[0].isIntersecting;
        onIntersecting();
      },
      {
        root: null,
        rootMargin,
        threshold
      }
    );

    observer.observe(div);
  });
</script>

<div bind:this={div}>
  {@render children({ intersecting: isIntersecting })}
</div>
