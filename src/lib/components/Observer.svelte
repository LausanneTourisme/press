<script lang="ts">
  import { type Snippet } from 'svelte';

  type Props = {
    class?: string;
    children: Snippet<[{ intersecting: boolean }]>;
    intersecting?: boolean;
    threshold?: number;
    rootMargin?: string;
    root?: null|Element
    onIntersecting?: (intersecting: boolean) => void;
  };

  const {
    class: additionalClass,
    children,
    intersecting = false,
    threshold = 0.75,
    rootMargin = "0px",
    root,
    onIntersecting = () => {}
  }: Props = $props();

  let isIntersecting = $state(intersecting);
  let div: HTMLElement;
  let observer: IntersectionObserver | null = null;

  $effect( () => {
    observer = new IntersectionObserver(
      (entries, observer) => {
        isIntersecting = entries[0].isIntersecting;
        onIntersecting(isIntersecting);
      },
      {
        root,
        rootMargin,
        threshold
      }
    );

    observer.observe(div);
  });
</script>

<div bind:this={div} class={additionalClass}>
  {@render children({ intersecting: isIntersecting })}
</div>
