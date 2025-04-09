<script lang="ts">
  import { maxMobileWidth } from '$lib/helpers';
  import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
  import emblaCarouselSvelte from 'embla-carousel-svelte';
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type Props = {
    children: Snippet<[{class: string}]>;
    options?: EmblaOptionsType;
    showButtons?: boolean;
    slidesToScroll?: number;
    class?: string;
    containerClass?: string;
  };

  const {
    class: additionalClass,
    slidesToScroll,
    options = {},
    showButtons = true,
    containerClass,
    children,
  }: Props = $props();

  let isMobile = $state(false);
  let emblaOptions: EmblaOptionsType = $state({});
  let emblaApi: EmblaCarouselType | undefined = $state();
  let previousButton: HTMLButtonElement;
  let nextButton: HTMLButtonElement;

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };

  const onInit = (event: CustomEvent<EmblaCarouselType>) => {
    emblaApi = event.detail;
    emblaApi.on('scroll', canScroll);
    canScroll();
  };

  const prev = () => {
    if (!emblaApi) return;

    emblaApi.scrollPrev();

    canScroll();
  };

  const next = () => {
    if (!emblaApi) return;

    emblaApi.scrollNext();

    canScroll();
  };

  const canScroll = () => {
    if (!emblaApi) return;

    !emblaApi.canScrollNext()
      ? nextButton.classList.add('hidden')
      : nextButton.classList.remove('hidden');

    !emblaApi.canScrollPrev()
      ? previousButton.classList.add('hidden')
      : previousButton.classList.remove('hidden');
  };

  onMount(() => {
    if (!slidesToScroll) {
      //prevent computing
      updateSize();
    }

    const defaultOptions: EmblaOptionsType = {
      loop: false,
      align: 'start',
      dragFree: true,
      slidesToScroll: slidesToScroll ?? (isMobile ? 1 : 2),
      axis: 'x'
    };

    emblaOptions = { ...defaultOptions, ...options };
    canScroll();
    /**
     * EVENT LISTENERS
     */
    if (!slidesToScroll) {
      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
    }

    return () => {
      if (!slidesToScroll) {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
      }
    };
  });
  const style = twMerge('relative', additionalClass);
</script>

<section class="embla {style}">
  <div
    class="embla__viewport"
    use:emblaCarouselSvelte="{{ options: emblaOptions, plugins: [] }}"
    onemblaInit={onInit}
  >
    <div class="embla__container {twMerge('flex', containerClass)}">
      {@render children({class: "embla__slide"})}
    </div>
  </div>
  <div class:hidden={!showButtons}>
    <button
      bind:this={previousButton}
      class="embla__prev absolute top-[calc(50%_-_48px)] left-1 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:bg-red-600"
      onclick={prev}
    >
      <ChevronLeft class="h-4 w-4" />
    </button>
    <button
      bind:this={nextButton}
      class="embla__next absolute top-[calc(50%_-_48px)] right-1 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:bg-red-600"
      onclick={next}
    >
      <ChevronRight class="h-4 w-4" />
    </button>
  </div>
</section>

<style>
  .embla {
    overflow: hidden;
  }

  :global(.embla__slide) {
    min-width: 0;
  }
</style>
