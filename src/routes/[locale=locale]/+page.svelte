<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes } from '$enums';
  import Anchor from '$lib/components/Anchor.svelte';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Counter from '$lib/components/Counter.svelte';
  import Faq from '$lib/components/Faq.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Player from '$lib/components/Media/Player.svelte';
  import Observer from '$lib/components/Observer.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import Themes from '$lib/components/Themes.svelte';
  import Trophies, { type Trophy } from '$lib/components/Trophies.svelte';
  import { getMediaLibraryRegisterLink, maxMobileWidth, route } from '$lib/helpers';
  import { City, Museum, Park, People, School, Sport } from '$lib/Icons';
  import { locale, t, type Locale } from '$lib/translations';
  import { onMount } from 'svelte';

  let isDarkMode = $state(false);
  let isMobile = $state(false);
  let displayAllThemes = $state(false);

  const trophies: Trophy[] = [
    {
      name: $t('page.distinctions.trophies.first.name'),
      content: $t('page.distinctions.trophies.first.content'),
      image: '/images/pages/home/articles/parc-musee-olympique.jpg',
      link: page.data.translations[locale.get()]['page.distinctions.trophies.first.link']
    },
    {
      name: $t('page.distinctions.trophies.second.name'),
      content: $t('page.distinctions.trophies.second.content'),
      image: '/images/pages/home/articles/52placestogo.jpg',
      link: page.data.translations[locale.get()]['page.distinctions.trophies.second.link']
    },
    {
      name: $t('page.distinctions.trophies.third.name'),
      content: $t('page.distinctions.trophies.third.content'),
      image: '/images/pages/home/articles/nature.jpg',
      link: page.data.translations[locale.get()]['page.distinctions.trophies.third.link']
    },
    {
      name: $t('page.distinctions.trophies.fourth.name'),
      content: $t('page.distinctions.trophies.fourth.content'),
      image: '/images/pages/home/articles/best-small-city.jpg',
      link: page.data.translations[locale.get()]['page.distinctions.trophies.fourth.link']
    }
  ];

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };
  // Listen for changes
  const updateDarkMode = () => {
    isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  onMount(() => {
    updateSize();
    updateDarkMode();
    displayAllThemes = sessionStorage.getItem('homeThemesExpanded') === 'true';
    /*
     *  Event listeners
     */
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateDarkMode);
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    // Cleanup event listener when the component is destroyed
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', updateDarkMode);
    };
  });

  const onVideoIntersecting = (isIntersecting: boolean) => {
    const nav = document.getElementById('main-nav');
    if (nav && !isMobile) {
      nav.classList.toggle('invisible-nav', isIntersecting); // Use second arg to set state explicitly
      // nav.classList.toggle('invisile-nav', !isIntersecting); // Use second arg to set state explicitly
      // nav.classList.toggle('hidden-nav', isIntersecting);
    }
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
        >{$t('page.hero.title').toUpperCase()}</span
      >
      <br />
      <span class="inline-block tracking-tight"
        >{$t('page.hero.subtitle')}<span
          class="shadow-gray-950 [text-shadow:_0_0_1px_var(--tw-shadow-color)]">!</span
        >
      </span>
    </Heading>
    <Paragraph
      class="3xl:max-w-[90%] text-justify text-white xl:max-w-[528px] xl:tracking-wide 2xl:max-w-[700px] 2xl:tracking-normal"
    >
      {$t('page.hero.paragraph')}
    </Paragraph>

    <Button class="hover:text-zinc-950" href={route(RouteTypes.Contact)} negative={true} tag="a">
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
  <Player
    autoplay={!isMobile}
    src="/videos/welcome_card_{$locale}.mp4"
    poster="/images/pages/home/poster-video.png"
    controls={true}
    onIntersecting={onVideoIntersecting}
    title="Welcome to Lausanne!"
  />
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
          <Button
            negative={isDarkMode}
            href={getMediaLibraryRegisterLink($locale as Locale)}
            tag="a"
          >
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
        <Button negative={true} href={route(RouteTypes.Highlights)} tag="a">
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
        <Button negative={true} href={route(RouteTypes.Pressrelease)} tag="a">
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
        <Button negative={true} href={route(RouteTypes.Coverage)} tag="a">
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
<Container fullscreen={true} class="mb-12">
  <Themes
    title={$t('themes.title')}
    paragraph={$t('themes.description')}
    expanded={displayAllThemes}
    onShowMore={() => sessionStorage.setItem('homeThemesExpanded', 'true')}
  />
</Container>
<!--
  -
  -
  -
  - Numbers >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Anchor name="numbers" />
<Container fullscreen={true} class="bg-shakespeare-100 dark:bg-shakespeare-400 md:px-16">
  <Heading class="pt-5 text-center">
    {$t('page.numbers')}
    {isMobile}
  </Heading>
  <Observer
    threshold={isMobile ? 0.5 : 0.75}
    rootMargin={isMobile ? '50%' : '100px'}
    class="stats stats-vertical xl:stats-horizontal w-full overflow-x-hidden rounded-none bg-transparent md:grid md:grid-cols-2 xl:flex xl:h-56 xl:items-start xl:justify-center"
  >
    {#snippet children({ intersecting })}
      <Counter animate={intersecting} value={350} label={$t('page.counter.park')}>
        {#snippet icon()}
          <Park class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
      <Counter animate={intersecting} value={150_000} label={$t('page.counter.people')}>
        {#snippet icon()}
          <People class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
      <Counter animate={intersecting} value={4} label={$t('page.counter.city')}>
        {#snippet icon()}
          <City class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
      <Counter animate={intersecting} value={21} label={$t('page.counter.museum')}>
        {#snippet icon()}
          <Museum class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
      <Counter animate={intersecting} value={11} label={$t('page.counter.school')}>
        {#snippet icon()}
          <School class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
      <Counter animate={intersecting} value={58} label={$t('page.counter.sport')}>
        {#snippet icon()}
          <Sport class="xl:h-12 xl:w-12 2xl:h-16 2xl:w-16" />
        {/snippet}
      </Counter>
    {/snippet}
  </Observer>
</Container>
<!--
  -
  -
  -
  - Distintions >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Anchor name="distinctions" />
<Container fullscreen={true} class="pt-16">
  <Heading class="mb-4 text-center">
    {$t('page.distinctions.title')}
  </Heading>
  <Paragraph centered class="p-6">
    {$t('page.distinctions.paragraph')}
  </Paragraph>

  <!-- TROPHIES -->
  <Container width="large">
    <Trophies values={trophies} />
  </Container>
</Container>
<!--
  -
  -
  -
  - Contact >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Container>
  <Heading class="text-center">
    {$t('page.contact.title')}
  </Heading>

  <Paragraph centered>
    {@html $t('page.contact.paragraph')}
  </Paragraph>
  <div class="text-center md:flex md:items-center md:justify-center">
    <div class="mt-12 md:mx-12">
      <article>
        <div class="avatar w-full">
          <div class="mx-auto w-48 rounded-full md:w-64">
            <Image src="/images/olivia.jpg" alt="Olivia Bosshart" />
          </div>
        </div>
        <Heading tag="h3">Olivia Bosshart</Heading>
        <Paragraph>Press & Public Relations Manager</Paragraph>
      </article>
    </div>
    <div class="mt-12 md:mx-12">
      <article>
        <div class="avatar w-full">
          <div class="mx-auto w-48 rounded-full md:w-64">
            <Image src="/images/laura.jpg" alt="Laura Ragonese" />
          </div>
        </div>
        <Heading tag="h3">Laura Ragonese</Heading>
        <Paragraph>Media & Press Coordinator</Paragraph>
      </article>
    </div>
  </div>
  <Paragraph class="text-center">
    <Button href={route(RouteTypes.Contact)} class="px-3 dark:text-white" tag="a">
      {$t('common.contact-us')}
    </Button>
  </Paragraph>
</Container>
<!--
  -
  -
  -
  - FAQ >>>>>>>>>>>>>>>>>>>>>>>
  -
  -
  -
  -->
<Anchor name="faq" />
<Container class="mb-16">
  <Heading class="my-8 text-center">
    {$t('page.faq.title')}
  </Heading>
  <Faq />
</Container>
