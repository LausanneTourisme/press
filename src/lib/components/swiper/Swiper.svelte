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

  const style = twMerge('relative', additionalClass);

  let swiper: Swiper | undefined;
  onMount(() => {
    swiper = new Swiper('.swiper', {
      breakpoints: {
        720: {
          slidesPerGroup: 2,
          spaceBetween: 20
        },
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
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },
      modules: [Navigation, Pagination]
    });

    const swiperEl = document.querySelector('.swiper');

    swiperEl!.addEventListener('wheel', (e) => {
      const event = e as WheelEvent;
      if (event.shiftKey) {
        event.preventDefault(); // prevent page scroll

        // simulate swiper control manually
        if (event.deltaY > 0) {
          swiper?.slideNext();
        } else if (event.deltaY < 0) {
          swiper?.slidePrev();
        }
      }
    });
  });
</script>

<div class={style}>
  <div class="swiper">
    <div class={twMerge('swiper-wrapper', containerClass)}>
      {@render children({ class: 'swiper-slide' })}
    </div>
  </div>
  {#if showNavigationButtons}
    <div
      class="swiper-button-next absolute top-2/5 -right-5 sm:-right-10 z-10 flex aspect-square h-8 w-8 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:cursor-pointer hover:bg-red-600"
    >
      <ChevronRight stroke="3" class="h-6 w-6 sm:h-8 sm:w-8" />
    </div>
    <div
      class="swiper-button-prev absolute top-2/5 -left-5 sm:-left-10 z-10 flex aspect-square h-8 w-8 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600/60 text-white transition-[background] hover:cursor-pointer hover:bg-red-600"
    >
      <ChevronLeft stroke="3" class="h-4 w-4 sm:h-8 sm:w-8" />
    </div>
  {/if}
  {#if showPagination}
    <div class="swiper-pagination !relative !bottom-0"></div>
  {/if}
</div>
