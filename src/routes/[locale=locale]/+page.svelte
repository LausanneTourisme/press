<script lang="ts">
  import { RouteTypes } from '$enums';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Player from '$lib/components/Media/Player.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import Themes from '$lib/components/Themes.svelte';
  import { getMediaLibraryRegisterLink, route, isDarkMode as getDarkMode } from '$lib/helpers';
  import { locale, t, type Locale } from '$lib/translations';
  import { onMount } from 'svelte';

  let isDarkMode = $state(false);

  onMount(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Set initial value
    isDarkMode = getDarkMode();

    // Listen for changes
    const updateDarkMode = () => {
      isDarkMode = getDarkMode();
    };

    darkModeQuery.addEventListener('change', updateDarkMode);

    // Cleanup event listener when the component is destroyed
    return () => darkModeQuery.removeEventListener('change', updateDarkMode);
  });

  const onVideoIntersecting = () => {
    console.log("intersecting video")
  //       const nav = document.getElementById('main-nav');
  //       if (nav) {
  //           if (browser && !Device.isMobile) {
  //               nav.classList.remove('bg-white', 'shadow-lg');
  //               nav.classList.add('invert-colours', 'bg-transparent', 'text-white');
  //           } else {
  //               nav.classList.remove('invert-colours', 'bg-transparent', 'text-white');
  //               nav.classList.add('bg-white', 'shadow-lg');
  //           }
  //       }
    };
</script>

<!--
  -
  -
  -
  - HERO >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Container
  fullscreen={true}
  class="relative min-h-[500px] items-end justify-start overflow-hidden md:flex md:items-center"
>
  <div class="p-6 text-left md:w-1/2 md:p-16 xl:mt-[25px] 2xl:mt-[5px]">
    <Heading tag="h1" class="text-white xl:whitespace-nowrap">
      <span class="inline-block pb-3 text-4xl font-light tracking-[0.45px]"
        >{$t('page.title').toUpperCase()}</span
      >
      <br />
      <span class="inline-block tracking-tight"
        >{$t('page.subtitle')}<span
          class="shadow-gray-950 [text-shadow:_0_0_1px_var(--tw-shadow-color)]">!</span
        >
      </span>
    </Heading>
    <Paragraph
      class="3xl:max-w-[90%] text-justify text-white xl:max-w-[528px] xl:tracking-wide 2xl:max-w-[700px] 2xl:tracking-normal"
    >
      {$t('page.hero.paragraph')}
    </Paragraph>

    <Button class="hover:text-zinc-950" href={route(RouteTypes.Contact)} negative={true}>
      {$t('common.contact-us')}
    </Button>
  </div>
  <div
    class="absolute top-0 left-0 -z-10 h-full w-full xl:scale-[120%] xl:object-left 2xl:scale-100"
  >
    <Image
      src="/images/pages/home/port-de-pully.jpg"
      class="object-center xl:scale-[84%] xl:object-left 2xl:scale-100"
      alt="Port de Pully"
      transform={{ g: 'west', c: 'auto' }}
    />
  </div>
</Container>

<!--
  -
  -
  -
  - PLAYER >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Container class="relative z-10 py-[3vh]" fullscreen={true}>
  <!-- FIXME <3 -->
  <!-- <Player
    src="/videos/welcome_card_{$locale}.mp4"
    poster="/images/pages/home/poster-video.png"
    controls={true}
    onIntersecting={onVideoIntersecting}
    title="Welcome to Lausanne!"
  /> -->
  <div>I don't want see video everytime</div>
</Container>
<!--
  -
  -
  -
  - VIDEOS AND IMAGES >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Container fullscreen={false}>
  <div class="md:flex md:h-96 md:flex-row-reverse">
    <article
      class="bg-shakespeare-100 dark:bg-shakespeare-400 flex flex-col justify-center p-6 py-12 md:w-1/2 md:p-16"
    >
      <Heading class="dark:text-white">
        {$t('page.video&images.title')}
      </Heading>
      <Paragraph class="dark:text-white">
        {$t('page.video&images.paragraph')}
      </Paragraph>
      <div>
        {#key isDarkMode}
          <Button negative={isDarkMode} href={getMediaLibraryRegisterLink($locale as Locale)}>
            {$t('page.goToMediaLibrary')}
          </Button>
        {/key}
      </div>
    </article>
    <Image
      src="/images/pages/home/masonry/cathedrale.jpg"
      transform={{ g: 'auto', c: 'fill', ar: '9:16' }}
      alt="Cathédrale de Lausanne"
      class="h-72 md:h-auto md:w-1/2"
    />
  </div>
</Container>
<!--
  -
  -
  -
  - Ressources >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Container fullscreen={true}>
  <div class="mt-6 md:flex md:h-96">
    <article
      class="bg-shakespeare-400 flex flex-col justify-center p-6 py-12 text-white md:w-1/2 md:p-16"
    >
      <Heading class="text-white">
        {$t('page.whatIsNew.title')}
      </Heading>
      <Paragraph class="text-white">
        {$t('page.whatIsNew.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Highlights)}>
          {$t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image
      src="/images/pages/home/nouveautes-lacustre.jpg"
      alt=""
      class="h-72 md:h-auto md:w-1/2"
    />
  </div>
  <div class="md:flex md:h-96 md:flex-row-reverse">
    <article
      class="bg-shakespeare-400 flex flex-col justify-center p-6 py-12 text-white md:w-1/2 md:p-16"
    >
      <Heading class="text-white">
        {$t('page.pressRelease.title')}
      </Heading>
      <Paragraph class="text-white">
        {$t('page.pressRelease.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Pressrelease)}>
          {$t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image
      src="/images/pages/home/communiques-de-presse.jpg"
      transform={{ c: 'fill' }}
      alt=""
      class="h-72 md:h-auto md:w-1/2"
    />
  </div>
  <div class="md:flex md:h-96">
    <article
      class="bg-shakespeare-400 flex flex-col justify-center p-6 py-12 text-white md:w-1/2 md:p-16"
    >
      <Heading class="text-white">
        {$t('page.mediaCoverage.title')}
      </Heading>
      <Paragraph class="text-white">
        {$t('page.mediaCoverage.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Coverage)}>
          {$t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image src="/images/pages/home/exposition.jpg" alt="" class="h-72 md:h-auto md:w-1/2" />
  </div>
</Container>
<!--
  -
  -
  -
  - THEMES >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
  <Themes/>