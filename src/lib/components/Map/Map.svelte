<script lang="ts">
  import { PUBLIC_MAPTILER_URL } from '$env/static/public';
  import { getTailwindColor, isOfflineMode } from '$lib/helpers';
  import { defaultLocale, locale, t, type Locale } from '$lib/translations';
  import type { Coordinate, Favorite, Geolocation, Lausanner, Poi } from '$types';
  import { ArrowRight, MapPin, SquareArrowOutUpRight, X } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import { MapLibre, Marker, NavigationControl, Popup } from 'svelte-maplibre-gl';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Heading from '../Heading.svelte';
  import Link from '../Link.svelte';
  import Image from '../Media/Image.svelte';
  import Paragraph from '../Paragraph.svelte';
  import LausannerCard from './LausannerCard.svelte';

  type Props = {
    class?: string;
    themeColor?: string;
    listBorderColor?: string;
    favorites: Favorite[];
    onclose?: () => void;
  };

  const {
    class: additionalClass,
    themeColor,
    listBorderColor,
    favorites,
    onclose
  }: Props = $props();

  const markers: {
    poiName: string;
    lausanner?: Lausanner;
    favorite: Favorite;
    coordinates: Coordinate;
  }[] = $state([]);
  let favoriteId: number | undefined = $state();

  const initialState = { lat: 46.5197163, lng: 6.6309901, zoom: 13 };

  let aside: {
    show: boolean;
    title: string;
    content: string;
    image: string;
    imageName: string;
    imageCopyright: string;
    lausanner: Lausanner | undefined;
  } = $state({
    show: false,
    title: '',
    content: '',
    image: '',
    imageName: '',
    imageCopyright: '',
    lausanner: undefined
  });

  const getLausannerUrl = ({
    lausanner,
    locale
  }: {
    lausanner: Lausanner | undefined;
    locale: Locale;
  }): string => {
    if (!lausanner) return '#';

    return (
      {
        fr: 'https://www.lausanne-tourisme.ch/fr/the-lausanner/auteur/',
        en: 'https://www.lausanne-tourisme.ch/en/the-lausanner/author/',
        de: 'https://www.lausanne-tourisme.ch/de/the-lausanner/autor/'
      }[locale] + lausanner.seo?.slug
    );
  };

  const handleLausannerClick = ({
    favorite,
    lausanner,
    isMarkerClick
  }: {
    favorite: Favorite;
    lausanner?: Lausanner;
    isMarkerClick?: boolean;
  }) => {
    const poi = favorite.pois?.at(0);
    favoriteId = favorite.id;

    aside.title = (poi?.name as string) ?? '';
    aside.content = favorite.content ?? '';
    aside.image = poi?.medias?.at(0) ? (poi.medias[0].cloudinary_id ?? '') : ''; // { w: 700 }
    aside.imageName = poi?.medias?.at(0)
      ? ((poi.medias[0].public_name as string | undefined) ?? '')
      : '';
    aside.imageCopyright = poi?.medias?.at(0) ? (poi.medias[0].copyright ?? '') : '';
    aside.lausanner = lausanner ?? favorite.lausanner;
    aside.show = true;

    // const geolocation = poi?.geolocations?.at(0);
    // const marker = getMarker(favorite.id);

    // if (!isMarkerClick) marker?.marker?._element?.click();

    // map?.flyTo({
    // 	center: [
    // 		Number(geolocation?.longitude ?? ''),
    // 		Number(geolocation?.latitude ?? ''),
    // 	],
    // 	zoom: 15,
    // 	essential: true
    // });
  };

  const closeAside = () => {
    onclose?.();
    aside.show = false;
    // TODO
    // getMarker(favoriteId)?.popup?.remove();

    favoriteId = undefined;

    // const boundsFromMarkers = getBoundsFromMarkers(markers);

    // map?.fitBounds(boundsFromMarkers, {
    // 	padding: 20
    // });
  };

  onMount(() => {
    favorites.forEach((favorite: Favorite) => {
      const { pois, lausanner } = favorite;

      pois?.forEach((poi: Poi) => {
        const { geolocations } = poi;
        geolocations?.forEach((geolocation: Geolocation) => {
          markers.push({
            poiName: poi.name as string,
            favorite,
            lausanner,
            coordinates: {
              lat: parseFloat(geolocation.latitude),
              lng: parseFloat(geolocation.longitude)
            }
          });
        });
      });
    });

    document.documentElement.style.setProperty('--popup-color', getTailwindColor(themeColor ?? ''));
  });
</script>

<div class="relative flex h-[550px] md:flex-row 2xl:h-[768px]">
  {#if favorites.length}
    <section class="map-tips z-0 h-full w-full overflow-y-hidden bg-gray-100 md:w-2/5">
      <div class={twMerge('relative h-full overflow-y-scroll p-4', aside.show ? 'hidden' : '')}>
        {#each favorites as favorite (favorite.id)}
          <LausannerCard {favorite} class={listBorderColor} onclick={handleLausannerClick} />
        {/each}
      </div>
      {#if aside.show}
        <div class="aside-popup h-full overflow-y-scroll p-4" transition:fade>
          <div class="relative">
            <button
              class="absolute top-2 left-2 flex cursor-pointer rounded-full border border-slate-300 bg-white p-2 hover:bg-gray-100"
              onclick={closeAside}
            >
              <X class="m-auto h-3 w-3" strokeWidth={3} />
            </button>
            <button class="h-56 w-full shadow" onclick={closeAside}>
              <Image
                src={isOfflineMode ? '/images/pages/themes/user_not_found.png' : aside.image}
                alt={aside.imageCopyright}
                useCloudinaryPreset={false}
                class="h-full w-full"
              />
            </button>
            <Heading tag="h3">
              {aside.title}
            </Heading>
            <Paragraph>
              {aside.content}
            </Paragraph>
          </div>
          <aside class={twMerge('flex items-center rounded-lg p-4', themeColor)}>
            <Image
              class="h-12 w-12 rounded-full"
              alt=""
              useCloudinaryPreset={false}
              src={isOfflineMode
                ? '/images/pages/themes/user_not_found.png'
                : (aside.lausanner?.medias?.at(0)?.cloudinary_id ??
                  '/images/pages/themes/user_not_found.png')}
              transform={{ g: 'north', c: 'auto', w: 48, h: 48 }}
            />
            <div class="flex w-full items-center justify-between">
              <Paragraph class="ml-2 inline-flex w-1/2 text-sm font-bold md:w-2/3 md:text-base">
                <Link
                  withIcon={true}
                  href={getLausannerUrl({
                    lausanner: aside.lausanner,
                    locale: ($locale as Locale) ?? defaultLocale
                  })}
                  class="text-left xl:text-center"
                >
                  {aside.lausanner?.name}

                  {#snippet icon()}
                    <SquareArrowOutUpRight class="ml-2 h-3 w-3" />
                  {/snippet}
                </Link>
              </Paragraph>
              <button
                class="inline-flex items-center py-2 hover:cursor-pointer hover:opacity-80"
                onclick={closeAside}
              >
                {$t('common.other-tips')}
                <ArrowRight class="ml-1 h-4 w-4" />
              </button>
            </div>
          </aside>
        </div>
      {/if}
    </section>
  {/if}
  <MapLibre
    class="h-full w-full"
    style={PUBLIC_MAPTILER_URL}
    zoom={initialState.zoom}
    center={initialState}
    locale={$locale}
    pitchWithRotate={false}
    cooperativeGestures={true}
  >
    <NavigationControl position={'top-right'} />
    {#each markers as marker}
      <Marker lnglat={marker.coordinates}>
        {#snippet content()}
          <MapPin class="stroke-brand-500 h-6 w-6 scale-90 text-transparent" strokeWidth={3} />
        {/snippet}
        <Popup
          open={favoriteId === marker.favorite.id}
          onopen={() => {
            setTimeout(() => handleLausannerClick({favorite: marker.favorite, isMarkerClick:true}), 50);
          }}
          onclose={closeAside}
          offset={{
            top: [0, 12],
            bottom: [0, -12],
            left: [12, 0],
            right: [-12, 0],
            center: [0, 0],
            'top-left': [0, 12],
            'top-right': [0, 12],
            'bottom-left': [0, -12],
            'bottom-right': [0, -12]
          }}
        >
          <span class="text-white text-base p-2">{marker.poiName}</span>
        </Popup>
      </Marker>
    {/each}
  </MapLibre>
</div>

<style lang="postcss">
  :global(.maplibregl-cooperative-gesture-screen) {
    z-index: 1 !important;
  }

  :global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
    border-top-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
    border-right-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
    border-left-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
    border-bottom-color: var(--popup-color) !important;
  }

  :global(.maplibregl-popup-anchor-top-right .maplibregl-popup-tip) {
    border-bottom-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-top-left .maplibregl-popup-tip) {
    border-bottom-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip) {
    border-top-color: var(--popup-color) !important;
  }
  :global(.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip) {
    border-top-color: var(--popup-color) !important;
  }

  :global(.maplibregl-popup-content) {
    display: flex !important;
    background-color: var(--popup-color) !important;
    padding: 0 !important;
    font-family: 'Euclid Flex', sans-serif !important;
    font-weight: bold;
  }

  :global(.maplibregl-popup-content div) {
    max-width: 320px !important;
    text-align: center !important;
  }

  :global(.maplibregl-popup-content button) {
    position: unset;
    width: 20px;
  }
</style>
