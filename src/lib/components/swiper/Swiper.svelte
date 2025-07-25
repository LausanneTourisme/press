<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';
  // core version + navigation, pagination modules :
  import Swiper from 'swiper';
  import { Navigation, Pagination } from 'swiper/modules';
  // import Swiper and modules styles
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';
  import 'swiper/css';
  import 'swiper/css/pagination';

  type Props = {
    class?: string;
    children: Snippet<[{ class: string }]>;
    containerClass?: string;
    showNavigationButtons?: boolean;
    showPagination?: boolean;
    centeredSlides?: boolean;
  };

  const {
    class: additionalClass,
    containerClass,
    showNavigationButtons = true,
    showPagination = true,
    centeredSlides = false,
    children
  }: Props = $props();

  let swiperEl: HTMLElement | undefined;
  let swiperNextEl: HTMLElement | undefined;
  let swiperPreviousEl: HTMLElement | undefined;
  let swiperPaginationEl: HTMLElement | undefined;
  const style = twMerge('relative', additionalClass);

  let swiper: Swiper | undefined;
  onMount(() => {
    swiper = new Swiper(swiperEl!, {
      breakpoints: {
        720: {
          slidesPerGroup: 2,
          spaceBetween: 20
        }
      },
      slidesPerGroup: 1,
      slidesPerView: 'auto',
      spaceBetween: 10,
      grabCursor: true,
      freeMode: true,
      centeredSlides,
      mousewheel: false,
      navigation: {
        disabledClass: '!hidden',
        nextEl: swiperNextEl,
        prevEl: swiperPreviousEl
      },
      pagination: {
        el: swiperPaginationEl,
        clickable: true
      },
      modules: [Navigation, Pagination]
    });

    swiperEl?.addEventListener('wheel', (e) => {
      const event = e as WheelEvent;
      if (event.shiftKey) {
        event.preventDefault(); // prevent page scroll

        // simulate swiper control manually
        if (event.deltaY > 0) {
          swiperNextEl?.click();
        } else if (event.deltaY < 0) {
          swiperPreviousEl?.click();
        }
      }
    });
  });
</script>

<div class={style}>
  <div class="swiper !p-0.5" bind:this={swiperEl}>
    <div class={twMerge('swiper-wrapper', containerClass)}>
      {@render children({ class: 'swiper-slide' })}
    </div>

    <div bind:this={swiperPaginationEl} class={twMerge(
      "swiper-pagination !relative !-bottom-1",
      showPagination ? '' : 'hidden'
    )}></div>
  </div>
  <div
    bind:this={swiperNextEl}
    class={twMerge(
      'swiper-button-next absolute top-2/5 -right-5 z-10 flex aspect-square h-10 w-10  sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:cursor-pointer hover:bg-red-600 sm:-right-10',
      showNavigationButtons ? '' : 'hidden'
    )}
  >
    <ChevronRight stroke="3" class="h-6 w-6 sm:h-8 sm:w-8" />
  </div>
  <div
    bind:this={swiperPreviousEl}
    class={twMerge(
      'swiper-button-prev absolute top-2/5 -left-5 z-10 flex aspect-square h-10 w-10  sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:cursor-pointer hover:bg-red-600 sm:-left-10',
      showNavigationButtons ? '' : 'hidden'
    )}
  >
    <ChevronLeft stroke="3" class="h-6 w-6 sm:h-8 sm:w-8" />
  </div>
</div>
