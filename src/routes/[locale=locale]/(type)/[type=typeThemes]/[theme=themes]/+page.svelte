<script lang="ts">
  import { page } from '$app/state';
  import { ThemeKeys, type Theme } from '$enums';
  import Button from '$lib/components/Button.svelte';
  import Container from '$lib/components/Container.svelte';
  import Figure from '$lib/components/Figure.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import Swiper from '$lib/components/Swiper.svelte';
  import { ThemeDetails } from '$lib/helpers/themes';
  import { locale, t } from '$lib/translations';
  import type { Post } from '$types';
  import { ArrowRight } from 'lucide-svelte';
  import moment from 'moment';
  import { fade } from 'svelte/transition';

  const highlightedArticle: Post|undefined = page.data.payload.highlightedArticle
  const articles: Post[] = page.data.payload.articles
  const theme: Theme = page.data.theme
  const title = highlightedArticle?.name ?? page.data.seo.title;

  if (typeof window !== 'undefined') {
    console.log(page.data.payload);
    window.moment = moment
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
  <div class="py-5 my-2"></div>
  <div in:fade>
    <Heading tag="h1">
        {title}
    </Heading>
    <div class="md:flex justify-between items-top">
        <div class="md:w-1/2 pr-4">
            <Paragraph class="md:mb-12">
                {highlightedArticle?.summary ?? page.data.seo.description}
            </Paragraph>
            {#if highlightedArticle}
                <Button href="{/*route(Web.articles)}/{data[0]?.id}/{data[0]?.seo.slug*/undefined}" class="inline-flex items-center">
                    {$t("themes.read-more")}
                    <ArrowRight class="w-4 h-4 ml-2"/>
                </Button>
            {/if}
        </div>
        <Figure class="md:w-1/2 h-72" src={ThemeDetails[ThemeKeys[theme]].image} alt={title} imgClass="rounded" transform={ThemeDetails[ThemeKeys[theme]]?.transform}/>
        <div class="{ThemeDetails[ThemeKeys[theme]].background} absolute rounded top-4 left-16 md:left-32 h-56 md:h-72 w-2/3 md:w-1/2 -z-10"></div>
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
      todo
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