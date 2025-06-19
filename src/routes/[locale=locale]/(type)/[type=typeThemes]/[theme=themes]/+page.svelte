<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/state';
  import { RouteTypes, ThemeKeys, Themes } from '$enums';
  import { Cloudinary } from '$lib/cloudinary';
  import Button from '$lib/components/Button.svelte';
  import Clickable from '$lib/components/Clickable.svelte';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Map from '$lib/components/Map/Map.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { Slide, Swiper } from '$lib/components/swiper';
  import { route } from '$lib/helpers';
  import { ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { ArrowRight } from 'lucide-svelte';
  import { DateTime } from 'luxon';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';

  const highlightedArticle = $derived((page.data as PageData).payload.highlightedArticle);
  const title = $derived(highlightedArticle?.name ?? (page.data as PageData).seo.title);
  const articles = $derived((page.data as PageData).payload.articles);
  const favorites = $derived((page.data as PageData).payload.favorites);
  const theme = $derived((page.data as PageData).theme);
  const themeInformation = $derived(ThemeDetails[ThemeKeys[(page.data as PageData).theme]]);
</script>

<!--
	-
	-
	-
	- HIGHLIGHT >>>>>>>>>>>>>>>>>>>>>>>
	-
	-
	-
	-->
<Container width="medium" class="relative mt-8">
  <div class="my-2 py-5"></div>
  <div in:fade>
    <Heading tag="h1">
      {title}
    </Heading>
    <div class="items-top justify-between md:flex">
      <div class="pr-4 md:w-1/2">
        <Paragraph class="md:mb-12">
          {highlightedArticle?.summary ?? page.data.seo.description}
        </Paragraph>
        {#if highlightedArticle}
          <Button
            tag="a"
            href={route(RouteTypes.Articles, {
              suffix: highlightedArticle?.seo?.slug as string | undefined
            })}
            class="inline-flex items-center"
          >
            {$t('themes.read-more')}
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        {/if}
      </div>
      <Figure
        class="h-72 md:w-1/2"
        src={themeInformation.image}
        alt={title}
        imgClass="rounded"
        transform={themeInformation.transform}
      />
      <div
        class={twMerge(
          themeInformation.color,
          'absolute top-4 left-16 -z-10 h-56 w-2/3 rounded md:left-32 md:h-72 md:w-1/2'
        )}
      ></div>
    </div>
  </div>
</Container>
<!--
	-
	-
	-
	- ARTICLES >>>>>>>>>>>>>>>>>>>>>>>
	-
	-
	-
	-->
{#if articles}
  <Container fullscreen={true} class="bg-gray-100 md:bg-gray-50">
    <Container width="medium">
      <Swiper>
        {#each articles as article}
          {#if article.seo}
            {@const publishedAt = DateTime.fromSeconds(
              parseInt(article?.published_at ?? '')
            ).setLocale($locale)}
            <Slide>
              <Clickable
                href={`${route(RouteTypes.Articles, { forceLocale: $locale as Locale })}/${article.seo.slug}`}
                overflow={true}
                class="card group bg-base-100 relative max-w-[290px] min-w-[220px] rounded-none shadow transition-all hover:shadow-lg sm:min-w-72 md:w-96"
              >
                <Figure
                  class="h-48 rounded"
                  src={Cloudinary.make(article.medias?.find(() => true)?.cloudinary_id ?? '').url({
                    w: 330
                  })}
                  alt=""
                />
                <div class="card-body h-64 px-4 sm:h-58">
                  <small class="text-sm text-gray-500">{publishedAt?.toFormat('dd.MM.yyyy')}</small>
                  <h2
                    class="card-title text-xl text-gray-700 transition-colors group-hover:text-gray-950"
                  >
                    {article.name}
                  </h2>
                  <p
                    class="-mb-2 line-clamp-3 text-base text-gray-700 transition-colors group-hover:text-gray-950"
                  >
                    {article.lead}
                  </p>
                  <div class="card-actions relative top-2 justify-end">
                    <div
                      class="flex items-center text-gray-500 transition-colors group-hover:text-gray-950"
                    >
                      {$t('themes.read')}&nbsp;
                      <ArrowRight class="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Clickable>
            </Slide>
          {/if}
        {/each}
      </Swiper>
    </Container>
  </Container>
{/if}
<!--
    -
    -
    -
    - LAUSANNERS >>>>>>>>>>>>>>>>>>>>>>>
    -
    -
    -
    -->
<Container width="medium" class="mt-4">
  <Heading>
    # {$t('themes.lausanners.title')}
  </Heading>
  <div class="flex">
    <div class="w-2/3 xl:w-1/2">
      <Paragraph>
        {$t('themes.lausanners.paragraph1')}
      </Paragraph>
      <Paragraph>
        {$t('themes.lausanners.paragraph2', { value: $t(`themes.${theme}.title`) })}
      </Paragraph>
      <Button href="https://www.lausanne-tourisme.ch/{$locale}/the-lausanner/" tag="a">
        {$t('themes.lausanners.button')}
      </Button>
    </div>
    <div class="flex w-1/3 items-center xl:w-1/2">
      <div class="h-32 xl:h-64">
        <Figure src={themeInformation.head} class="aspect-square max-h-32 xl:max-h-64" />
      </div>
    </div>
  </div>
</Container>
<!--
    -
    -
    -
    - MAP >>>>>>>>>>>>>>>>>>>>>>>
    -
    -
    -
    -->
<Container width="padded" class="md:pt-0">
  <Map
    {favorites}
    themeColor={themeInformation.color}
    listBorderColor={themeInformation.borderColor}
  />
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
<Container width="padded" class="bg-gray-100 md:bg-gray-50">
  <Container width="medium">
    <Heading class="text-center">
      {$t('themes.other')}&nbsp;:
    </Heading>
  </Container>
  <Swiper>
    {#each Object.values(Themes) as theme}
      {@const selecteTheme = ThemeDetails[ThemeKeys[theme]]}
      <Slide class="w-max xs:w-min!">
        <Clickable
          href={route(RouteTypes.Themes, { theme, forceLocale: $locale as Locale })}
          overflow={true}
          class="card group relative h-[360px] w-full xs:w-80 md:h-[460px] md:w-[375px] min-w-[220px] rounded-none shadow-none md:ml-0"
        >
            <figure
              class="pointer-events-none absolute top-0 left-0 -z-20 h-full w-full transition-all group-hover:opacity-80"
            >
              <Image
                src={selecteTheme.image}
                transform={selecteTheme.transform ?? { g: 'auto', c: 'auto' }}
              />
            </figure>
            <div
              class="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full transition-all {selecteTheme.background} opacity-50 group-hover:opacity-60"
            ></div>
            <div class="absolute bottom-0 left-0">
              <Heading
                tag="h3"
                class="my-4 px-4 text-clip whitespace-break-spaces text-white md:text-3xl"
                title={$t(`themes.${theme}.title`)}
              >
                {$t(`themes.${theme}.title`)}
              </Heading>
            </div>
        </Clickable>
      </Slide>
    {/each}
  </Swiper>
</Container>
