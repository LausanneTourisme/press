<script lang="ts">
  import { afterNavigate, beforeNavigate } from '$app/navigation';
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
  import { t, type Locale } from '$lib/translations';
  import { onDestroy, onMount } from 'svelte';

  const locale = $derived(page.params.locale as Locale);
  let isMobile = $state(false);
  let displayAllThemes = $state(false);
  let cancelScrollRestore = () => {};
  let videoUrl = $derived.by(() => `/pages/home/welcome_card_${locale}.mp4`);

  const trophies: Trophy[] = [
    {
      name: $t('page.distinctions.trophies.first.name'),
      content: $t('page.distinctions.trophies.first.content'),
      image: '/pages/home/articles/parc-musee-olympique.jpg',
      link: $t('page.distinctions.trophies.first.link')
    },
    {
      name: $t('page.distinctions.trophies.second.name'),
      content: $t('page.distinctions.trophies.second.content'),
      image: '/pages/home/articles/52placestogo.jpg',
      link: $t('page.distinctions.trophies.second.link')
    },
    {
      name: $t('page.distinctions.trophies.third.name'),
      content: $t('page.distinctions.trophies.third.content'),
      image: '/pages/home/articles/nature.jpg',
      link: $t('page.distinctions.trophies.third.link')
    },
    {
      name: $t('page.distinctions.trophies.fourth.name'),
      content: $t('page.distinctions.trophies.fourth.content'),
      image: '/pages/home/articles/best-small-city.jpg',
      link: $t('page.distinctions.trophies.fourth.link')
    }
  ];

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };

  const onVideoIntersecting = (isIntersecting: boolean) => {
    const nav = document.getElementById('main-nav');
    if (nav && !isMobile) {
      nav.classList.toggle('invisible-nav', isIntersecting);
    }
  };

  beforeNavigate(({ type }) => {
    cancelScrollRestore();
    if (type === 'popstate') return;
    sessionStorage.setItem('homeScrollY', String(window.scrollY));
    sessionStorage.setItem('homeThemesExpanded', String(displayAllThemes));
  });

  afterNavigate((navigation) => {
    const { type } = navigation;
    // afterNavigate fires on both the source and destination page during a transition.
    // Guard so the restore only runs when we're actually arriving at the homepage.
    const arrivingHere = navigation.to?.url?.pathname === `/${locale}`;

    // Restore themes state synchronously before SvelteKit restores scroll (avoids layout shift)
    const saved = sessionStorage.getItem('homeThemesExpanded');
    if (saved !== null) displayAllThemes = saved === 'true';

    if (type === 'popstate') {
      if (!arrivingHere) return;
      const savedY = Number(sessionStorage.getItem('homeScrollY') ?? 0);
      if (savedY > 0) {
        let cancelled = false;
        cancelScrollRestore = () => {
          cancelled = true;
        };
        let lastH = 0,
          stable = 0;
        const tryScroll = () => {
          if (cancelled) return;
          const h = document.documentElement.scrollHeight;
          if (h === lastH) stable++;
          else {
            stable = 0;
            lastH = h;
          }
          if (stable >= 3) window.scrollTo({ top: savedY, behavior: 'instant' });
          else requestAnimationFrame(tryScroll);
        };
        requestAnimationFrame(tryScroll);
      }
    } else if (type === 'link' || type === 'goto') {
      if (arrivingHere) {
        displayAllThemes = false;
        sessionStorage.removeItem('homeScrollY');
        sessionStorage.removeItem('homeThemesExpanded');
      }
    }
  });

  onDestroy(() => cancelScrollRestore());

  onMount(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  });
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
  class="relative min-h-125 items-end justify-start overflow-hidden md:flex md:items-center"
>
  <div
    class="p-6 text-left shadow-gray-950 [text-shadow:0_0_1px_var(--tw-shadow-color)] md:w-1/2 md:p-16 lg:w-1/2"
  >
    <Heading tag="h1" class="w-full text-white">
      <span class="inline-block pb-3 text-4xl font-light tracking-[0.45px]">
        {@html $t('page.hero.title').toUpperCase()}
      </span>
      <br />
      <span class="inline-block tracking-tight">{@html $t('page.hero.subtitle')}</span>
    </Heading>
    <Paragraph class="w-full text-justify text-white xl:tracking-wide 2xl:tracking-normal">
      {@html $t('page.hero.paragraph')}
    </Paragraph>

    <Button class="hover:text-zinc-950" href={route(RouteTypes.Contact)} negative={true} tag="a">
      {@html $t('common.contact-us')}
    </Button>
  </div>
  <div
    class="absolute top-0 left-0 -z-10 h-full w-full xl:scale-[120%] xl:object-left 2xl:scale-100"
  >
    <Image
      alt="Port de Pully"
      title="Port de Pully"
      class="object-center xl:scale-[84%] xl:object-left 2xl:scale-100"
      localSrc="/pages/home/mobile.jpg"
      src="/pages/home/mobile"
      transform={{ gravity: 'west', crop: 'auto', width: 1280 }}
      srcset={[
        {
          size: 768,
          transform: { gravity: 'west', crop: 'auto', width: 1280 },
          src: '/pages/home/ipad',
          usePreset: true
        },
        {
          size: 1280,
          transform: { gravity: 'west', crop: 'auto', width: 1920 },
          src: '/pages/home/fhd',
          usePreset: true
        },
        {
          size: 2560,
          transform: { gravity: 'west', crop: 'auto', height: 500, width: 2560 },
          src: '/pages/home/4k',
          usePreset: true
        }
      ]}
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
    src={videoUrl}
    poster="/pages/home/poster-video.png"
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
        {@html $t('page.video&images.title')}
      </Heading>
      <Paragraph class="dark:text-white">
        {@html $t('page.video&images.paragraph')}
      </Paragraph>
      <div>
        <Button href={getMediaLibraryRegisterLink(locale)} tag="a">
          {@html $t('page.goToMediaLibrary')}
        </Button>
      </div>
    </article>
    <Image
      class="h-72 md:h-auto md:w-1/2"
      alt="Cathédrale de Lausanne"
      title="Cathédrale de Lausanne"
      localSrc="/pages/home/masonry/cathedrale.jpg"
      src="/pages/home/masonry/cathedrale"
      transform={{ gravity: 'auto', crop: 'fill', ar: '1:1', width: 720 }}
      srcset={[
        {
          size: 500,
          transform: { gravity: 'auto', crop: 'fill', width: 1000, height: 600 },
          src: '/pages/home/masonry/cathedrale',
          usePreset: true
        },
        {
          size: 768,
          transform: { gravity: 'north', crop: 'auto', ar: '9:16', width: 600, height: 768 },
          src: '/pages/home/masonry/cathedrale',
          usePreset: true
        },
        {
          size: 900,
          transform: { gravity: 'north', crop: 'auto', ar: '9:16', width: 800, height: 1152 },
          src: '/pages/home/masonry/cathedrale',
          usePreset: true
        },
        {
          size: 1280,
          transform: { gravity: 'auto', crop: 'fill', aspect_ratio: '17:9', height: 384 },
          src: '/pages/home/masonry/cathedrale',
          usePreset: true
        },
        {
          size: 1920,
          transform: { gravity: 'auto', crop: 'fill', aspect_ratio: '17:9', height: 500 },
          src: '/pages/home/masonry/cathedrale',
          usePreset: true
        }
      ]}
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
        {@html $t('page.whatIsNew.title')}
      </Heading>
      <Paragraph class="text-white">
        {@html $t('page.whatIsNew.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Highlights)} tag="a">
          {@html $t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image
      alt="Lacustre"
      title={$t('page.whatIsNew.title')}
      class="h-72 md:h-auto md:w-1/2"
      localSrc="/pages/home/nouveautes-lacustre.jpg"
      src="/pages/home/nouveautes-lacustre"
      transform={{ width: 1280 }}
      srcset={[
        {
          size: 1280,
          transform: { width: 1920 },
          src: '/pages/home/nouveautes-lacustre',
          usePreset: true
        },
        {
          size: 2560,
          transform: { width: 2560 },
          src: '/pages/home/nouveautes-lacustre',
          usePreset: true
        }
      ]}
    />
  </div>
  <div class="md:flex md:h-96 md:flex-row-reverse">
    <article
      class="bg-shakespeare-400 flex flex-col justify-center p-6 py-12 text-white md:w-1/2 md:p-16"
    >
      <Heading class="text-white">
        {@html $t('page.pressRelease.title')}
      </Heading>
      <Paragraph class="text-white">
        {@html $t('page.pressRelease.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Pressreleases)} tag="a">
          {@html $t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image
      class="h-72 md:h-auto md:w-1/2"
      alt="Communiques de presse"
      title={$t('page.pressRelease.title')}
      src="/pages/home/communiques-de-presse"
      localSrc="/pages/home/communiques-de-presse.jpg"
      transform={{ crop: 'fill', width: 1280 }}
      srcset={[
        {
          size: 1280,
          transform: { crop: 'fill', width: 1920 },
          src: '/pages/home/communiques-de-presse',
          usePreset: true
        },
        {
          size: 2560,
          transform: { crop: 'fill', width: 2560 },
          src: '/pages/home/communiques-de-presse',
          usePreset: true
        }
      ]}
    />
  </div>
  <div class="md:flex md:h-96">
    <article
      class="bg-shakespeare-400 flex flex-col justify-center p-6 py-12 text-white md:w-1/2 md:p-16"
    >
      <Heading class="text-white">
        {@html $t('page.mediaCoverage.title')}
      </Heading>
      <Paragraph class="text-white">
        {@html $t('page.mediaCoverage.paragraph')}
      </Paragraph>
      <div>
        <Button negative={true} href={route(RouteTypes.Coverages)} tag="a">
          {@html $t('common.btn.learnMore')}
        </Button>
      </div>
    </article>
    <Image
      class="h-72 md:h-auto md:w-1/2"
      alt="Exposition"
      title={$t('page.mediaCoverage.title')}
      src="/pages/home/exposition"
      localSrc="/pages/home/exposition.jpg"
      srcset={[
        {
          size: 1280,
          src: '/pages/home/exposition',
          usePreset: true
        },
        {
          size: 2560,
          src: '/pages/home/exposition',
          usePreset: true
        }
      ]}
    />
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
    onShowMore={() => {
      displayAllThemes = true;
      sessionStorage.setItem('homeThemesExpanded', 'true');
    }}
    {locale}
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
    {@html $t('page.numbers')}
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
    {@html $t('page.distinctions.title')}
  </Heading>
  <Paragraph centered class="p-6">
    {@html $t('page.distinctions.paragraph')}
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
    {@html $t('page.contact.title')}
  </Heading>

  <Paragraph centered>
    {@html $t('page.contact.paragraph')}
  </Paragraph>
  <div class="text-center md:flex md:items-center md:justify-center">
    <div class="mt-12 md:mx-12">
      <article>
        <div class="avatar w-full">
          <div class="mx-auto w-48 rounded-full md:w-64">
            <Image
              alt="Olivia Bosshart"
              title="Olivia Bosshart"
              localSrc="/olivia.jpg"
              src="/olivia"
              transform={{ width: 512, aspect_ratio: '1:1' }}
            />
          </div>
        </div>
        <Heading tag="h3">Olivia Bosshart</Heading>
        <Paragraph>Press & Public Relations Manager</Paragraph>
      </article>
    </div>
  </div>
  <Paragraph class="text-center">
    <Button href={route(RouteTypes.Contact)} class="px-3 dark:text-white" tag="a">
      {@html $t('common.contact-us')}
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
    {@html $t('common.faq.title')}
  </Heading>
  <Faq {locale} />
</Container>
