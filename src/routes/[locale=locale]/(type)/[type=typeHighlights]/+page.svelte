<script lang="ts">
  import { page } from '$app/state';
  import { Cloudinary } from '$lib/cloudinary';
  import Anchor from '$lib/components/Anchor.svelte';
  import Card from '$lib/components/Card.svelte';
  import Clickable from '$lib/components/Clickable.svelte';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { Slide, Swiper } from '$lib/components/swiper';
  import { chunkify, maxMobileWidth } from '$lib/helpers';
  import { extractStartEndDate, isSameDays } from '$lib/helpers/date';
  import { locale, t, type Locale } from '$lib/translations';
  import type { Poi } from '$types';
  import { Calendar } from 'lucide-svelte';
  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';

  const pageData = page.data as PageData;
  const events = $derived((page.data as PageData).events);
  const news = $derived((page.data as PageData).news);
  const groupPois = $derived.by(() => {
    const pageData = page.data as PageData;
    return (
      (pageData.group?.pois?.map((poi) => ({
        ...poi,
        href: `https://www.lausanne-tourisme.ch${poi.seo?.hreflang}`
      })) as (Poi<string> & { href: string })[]) ?? []
    );
  });
  let poisChunks: (Poi<string> & { href: string })[][] = $state([]);

  let isMobile = $state(false);

  const updateSize = () => {
    isMobile = window.innerWidth < maxMobileWidth;
  };

  onMount(() => {
    updateSize();

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    // Cleanup event listener when the component is destroyed
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
    };
  });
  $effect(() => {
    poisChunks = chunkify(groupPois ?? [], 11);
  });
</script>

<!--
	-
	-
	-
	- NEWS >>>>>>>>>>>>>>>>>>>>>>>
	-
	-
	-
	-->
<Anchor name="news" />
<Container width="medium">
  <Heading tag="h1">
    {$t('page.news.title')}
  </Heading>
  <Paragraph>
    {$t('page.news.paragraph')}
  </Paragraph>
</Container>
<!-- NEWS SWIPER -->
<Container width="large">
  <Swiper>
    {#each news as n, k (`${n.published_at}-${n.name}`)}
      <Slide>
        <Clickable overflow={true} href={n.link ?? '#'}>
          <Card
            src={Cloudinary.make(n.medias?.at(0)?.cloudinary_id ?? '').url({
              w: 500,
              h: 500,
              ar: '16:9',
              g: 'auto',
              c: 'fill'
            })}
            alt={n.medias?.at(0)?.public_name}
            background="bg-glacier-300"
            class="carousel-item"
            nofx={true}
          >
            <p>
              <small>
                {$t('common.published-at')}&nbsp;{DateTime.fromSeconds(Number(n.published_at))
                  .setLocale($locale)
                  .toFormat('dd/MM/yyyy')}
              </small>
            </p>
            <Heading
              tag="h3"
              class="text-shadow:_0_0_20px_var(--tw-shadow-color)] text-white shadow-gray-950"
            >
              {n.name}
            </Heading>
            <Paragraph
              class="text-shadow:_0_0_2px_var(--tw-shadow-color)] text-white shadow-gray-950"
            >
              {n.lead}
            </Paragraph>
          </Card>
        </Clickable>
      </Slide>
    {/each}
  </Swiper>
</Container>
<!--
	-
	-
	-
	- HIGHLIGHTS >>>>>>>>>>>>>>>>>>>>>>>
	-
	-
	-
	-->
<Anchor name="highlights" />
<Container width="medium">
  <Heading class="py-4 text-center text-3xl">
    {$t('page.highlights.title')}
  </Heading>
  <Paragraph>
    {$t('page.highlights.paragraph')}
  </Paragraph>
  {#each poisChunks as chunk}
    <div
      class="pois mt-12 grid grid-flow-row grid-cols-2 grid-rows-1 gap-2 md:grid-cols-4 md:grid-rows-12 md:gap-4"
    >
      {#each chunk as poi, index}
        <div
          class={twMerge(
            'child',
            'group flex items-end overflow-hidden',
            //DESKTOP CSS
            [
              'desktop-0 md:col-span-2 md:row-span-6 md:aspect-square',
              'desktop-1 md:col-start-3 md:row-span-5',
              'desktop-2 md:col-start-4 md:row-span-5',
              'desktop-3 md:col-start-3 md:row-span-6 md:row-start-6',
              'desktop-4 md:row-span-5 md:row-start-7',
              'desktop-5 md:row-span-5 md:row-start-7',
              'desktop-6 md:col-span-2 md:row-span-12',
              'desktop-7 md:row-span-12',
              'desktop-8 md:row-span-12',
              'desktop-9 md:col-span-2 md:row-span-12',
              'desktop-10 md:col-span-2 md:row-span-12'
            ].at(index % (chunk.length + 1)) ?? '',
            //MOBILE CSS
            [
              'mobile-0 col-span-2 h-56 md:h-auto',
              'mobile-1 col-span-1 h-56 md:h-auto',
              'mobile-2 col-span-1 h-56 md:h-auto'
            ].at(index % 3) ?? ''
          )}
        >
          <Clickable href={poi.href} class="relative h-full w-full">
            <article class="flex h-full w-full items-end">
              <!-- we want every first element to be bigger -->
              <header
                class="from-shakespeare-500 absolute top-0 left-0 -z-10 h-full w-full bg-gradient-to-t to-gray-900/50"
              >
                <Image
                  src={Cloudinary.make(poi.medias?.at(0)?.cloudinary_id ?? '').url({
                    height: 500
                  })}
                  height={500}
                  ignoreAutoSize={true}
                  class="transition-opacity group-hover:opacity-50"
                  alt={poi?.medias?.at(0)?.copyright}
                />
              </header>
              <Heading
                class="relative z-0 w-full bg-gradient-to-t from-zinc-950/50 to-transparent p-2 text-sm text-white md:p-4 md:text-xl"
              >
                {poi.name}
              </Heading>
            </article>
          </Clickable>
        </div>
      {/each}
    </div>
  {/each}
</Container>
<!--
	-
	-
	-
	- AGENDA >>>>>>>>>>>>>>>>>>>>>>>
	-
	-
	-
	-->
<Container width="agenda" fullscreen={isMobile} background="bg-agenda-500">
  <Heading class="mb-4 p-4 text-center">
    {$t('page.agenda.title')}
  </Heading>
  <Swiper showPagination={false}>
    {#each events as event}
      {@const date = extractStartEndDate(event, {
        start: DateTime.now().toSQLDate(),
        end: undefined
      })}
      {@const sameDate = isSameDays(event, { start: DateTime.now().toSQLDate(), end: undefined })}
      {@const media = event.medias?.find((x) => x.is_cover)}
      {@const slug = event.seo?.hreflang?.[$locale as Locale]}
      {#if slug}
        <Slide>
          <Clickable
            overflow={true}
            href={`https://www.lausanne-tourisme.ch${slug}`}
            class="inline-block"
          >
            <div class="card rounded-none shadow-none" transition:fade>
              <div class="card-body p-4">
                <figure class="pointer-events-none aspect-square w-44 sm:w-72">
                  <Image
                    src={Cloudinary.make(media?.cloudinary_id ?? '').url({ h: 330 })}
                    alt={media?.name}
                  />
                </figure>
                <Heading
                  tag="h3"
                  class="lt-agenda-title my-2 mb-2 line-clamp-2 h-16 max-h-16 text-2xl leading-snug font-semibold tracking-tight text-clip"
                  title={event.name?.[$locale as Locale]}
                >
                  {event.name?.[$locale as Locale]}
                </Heading>
                <div class="lt-agenda-highlight-dates flex items-center">
                  <div class="mr-2 mb-1">
                    <Calendar class="text-honey-500" size="24px" />
                  </div>

                  <p class="flex w-full text-sm">
                    {#if sameDate}
                      <span>
                        {date?.start?.toFormat('dd.MM.yy')}
                      </span>
                    {:else}
                      <span>
                        {date?.start?.toFormat('dd.MM.yy')}
                      </span>

                      <span class="px-1"> - </span>

                      <span>
                        {date?.end?.toFormat('dd.MM.yy')}
                      </span>
                    {/if}
                  </p>
                </div>
              </div>
            </div>
          </Clickable>
        </Slide>
      {/if}
    {/each}
  </Swiper>
</Container>
