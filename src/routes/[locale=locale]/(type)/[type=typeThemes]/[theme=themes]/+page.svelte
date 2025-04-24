<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes, ThemeKeys, type Theme } from '$enums';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Map from '$lib/components/Map/Map.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { route } from '$lib/helpers';
  import { ThemeDetails } from '$lib/helpers/themes';
  import { locale, t } from '$lib/translations';
  import type { Favorite, Post } from '$types';
  import { ArrowRight } from 'lucide-svelte';
  import moment from 'moment';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  const highlightedArticle: Post | undefined = $derived(page.data.payload.highlightedArticle);
  const title: string = $derived(highlightedArticle?.name ?? page.data.seo.title);
  const articles: Post[] = $derived(page.data.payload.articles);
  const favorites: Favorite[] = $derived(page.data.payload.favorites);
  const theme: Theme = page.data.theme;
  const themeInformation = ThemeDetails[ThemeKeys[theme]];

  if (typeof window !== 'undefined') {
    console.log(page.data.payload);
    window.moment = moment;
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
            href={route(RouteTypes.Articles, { suffix: highlightedArticle?.seo?.slug })}
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
<Container fullscreen={true} class="bg-gray-100 md:bg-gray-50">
  <Container width="medium">
    todo swiper
    <!-- <Swiper containerClass={"md:m-0 py-4 flex gap-x-4"}> -->
    <!-- {#each articles as article}
          {@const publishedAt = DateTime.fromSeconds(parseInt(article.published_at)).setLocale($locale)}
          {#key article.seo.slug}
            <Clickable href={`${route(Web.articles)}/${article.id}/${article.seo.slug}`}
                       overflow={true}
                       class="group card min-w-72 md:w-96 bg-base-100 shadow hover:shadow-lg rounded-none transition-all">
              <Figure class="h-48 rounded"
                      src="{Cloudinary.make(article.medias?.find(() => true)?.cloudinary_id ?? '').url({w: 330})}"
                      alt="" />
              <div class="card-body px-4 h-64">
                <small class="text-gray-500">{publishedAt?.toFormat("dd.MM.yyyy")}</small>
                <h2 class="card-title text-gray-700 group-hover:text-gray-950 transition-colors">{article.name}</h2>
                <p class="line-clamp-3 text-gray-700 group-hover:text-gray-950 transition-colors -mb-2">{article.lead}</p>
                <div class="card-actions justify-end relative top-2">
                  <div class="flex items-center text-gray-500 group-hover:text-gray-950 transition-colors">
                    {$_("Lire")}&nbsp;
                    <ArrowRightSolid class="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Clickable>
          {/key}
        {/each}
      </Swiper> -->
  </Container>
</Container>
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
<Container width="padded">
  <Map
    {favorites}
    themeColor={themeInformation.color}
    listBorderColor={themeInformation.borderColor}
  />
</Container>
