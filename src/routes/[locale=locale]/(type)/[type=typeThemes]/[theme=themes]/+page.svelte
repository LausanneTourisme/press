<script lang="ts">
  import { dev } from '$app/environment';
  import { page } from '$app/state';
  import { RouteTypes, ThemeKeys } from '$enums';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Map from '$lib/components/Map/Map.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { route } from '$lib/helpers';
  import { ThemeDetails } from '$lib/helpers/themes';
  import { locale, t, type Locale } from '$lib/translations';
  import { ArrowRight } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import type { PageData } from './$types';
  import { Swiper, Slide } from '$lib/components/swiper';
  import Clickable from '$lib/components/Clickable.svelte';
  import { DateTime } from 'luxon';
  import { Cloudinary } from '$lib/cloudinary';

  const pageData = page.data as PageData;
  const highlightedArticle = $derived(pageData.payload.highlightedArticle);
  const title = $derived(highlightedArticle?.name ?? pageData.seo.title);
  const articles = $derived(pageData.payload.articles ?? []);
  const favorites = $derived(pageData.payload.favorites ?? []);
  const theme = pageData.theme;
  const themeInformation = ThemeDetails[ThemeKeys[theme]];

  if (typeof window !== 'undefined') {
    if (dev) console.log(page.data.payload);
  }
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
        src={ThemeDetails[ThemeKeys[theme]].image}
        alt={title}
        imgClass="rounded"
        transform={ThemeDetails[ThemeKeys[theme]]?.transform}
      />
      <div
        class={twMerge(
          ThemeDetails[ThemeKeys[theme]].color,
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
              class="card group bg-base-100 relative min-w-[220px] max-w-[290px] rounded-none shadow transition-all hover:shadow-lg sm:min-w-72 md:w-96"
            >
              <Figure
                class="h-48 rounded"
                src={Cloudinary.make(article.medias?.find(() => true)?.cloudinary_id ?? '').url({
                  w: 330
                })}
                alt=""
              />
              <div class="card-body h-64 sm:h-58 px-4">
                <small class="text-gray-500 text-sm">{publishedAt?.toFormat('dd.MM.yyyy')}</small>
                <h2 class="card-title text-xl text-gray-700 transition-colors group-hover:text-gray-950">
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
<Container fullscreen={true} class="bg-gray-100 md:bg-gray-50">
  <Container width="medium">TODO THEME SWIPER</Container>
</Container>
