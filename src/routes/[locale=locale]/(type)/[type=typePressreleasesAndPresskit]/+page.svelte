<script lang="ts">
  import { page } from '$app/state';
  import { RouteTypes } from '$enums';
  import { Cloudinary } from '$lib/cloudinary';
  import Card from '$lib/components/Card.svelte';
  import Clickable from '$lib/components/Clickable.svelte';
  import Container from '$lib/components/Container.svelte';
  import Heading from '$lib/components/Heading.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { Slide, Swiper } from '$lib/components/swiper';
  import { route } from '$lib/helpers';
  import { locale, t, type Locale } from '$lib/translations';
  import { DateTime } from 'luxon';
  import { fade } from 'svelte/transition';
  import type { PageData } from './$types';

  const releasesByDates = $derived((page.data as PageData).payload.releasesByDates);

  const truncate = (string: string, limit: number) => {
    return string.length > limit ? `${string.substring(0, limit)}...` : string;
  };
</script>

<Container fullscreen={true}>
  <Container width="medium">
    <Heading tag="h1">
      {$t('page.heading')}
    </Heading>
    <Paragraph>
      {$t('page.description')}
    </Paragraph>
    {#if releasesByDates.size === 0}
      {$t('page.no-releases')}
    {:else}
      {#each releasesByDates as [year, releases]}
        <Heading class="pt-3 pb-6 2xl:pt-8 2xl:pb-12 2xl:text-5xl">
          {year}
        </Heading>

        <section class="mb-6" transition:fade={{ delay: 150 }}>
          <Swiper showPagination={false}>
            {#each releases as release}
              {#if release?.seo?.slug}
                <Slide>
                  {@const routeType =
                    release.type === 'press_kit' ? RouteTypes.Presskit : RouteTypes.Pressrelease}
                  <div class="block px-1 md:flex">
                    <Clickable
                      overflow={false}
                      href={`${route(routeType, { forceLocale: $locale as Locale })}/${release.seo?.slug}`}
                      title={release.name}
                    >
                      <Card
                        src={Cloudinary.make(release.medias?.at(0)?.cloudinary_id ?? 'default').url({
                          h: 440
                        })}
                        alt={`${release.medias?.at(0)?.public_name} - ${release.medias?.at(0)?.copyright}`}
                        background="bg-shakespeare-700"
                        class="carousel-item w-auto"
                      >
                        <p>
                          <small>
                            {$t('common.published-at')}
                            &nbsp;{DateTime.fromSeconds(parseInt(release.published_at ?? ''))
                              .setLocale($locale)
                              .toFormat('dd/MM/yyyy')}
                          </small>
                        </p>
                        <Heading tag="h3" class="text-white">
                          {release.name}
                        </Heading>
                        <Paragraph class="text-white" title={release.lead}>
                          {truncate(release.lead ?? '', 100)}
                        </Paragraph>
                      </Card>
                    </Clickable>
                  </div>
                </Slide>
              {/if}
            {/each}
          </Swiper>
        </section>
      {/each}
    {/if}
  </Container>
</Container>
