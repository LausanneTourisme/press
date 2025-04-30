<script lang="ts">
  import { PUBLIC_MAPTILER_URL } from '$env/static/public';
  import Heading from '$lib/components/Heading.svelte';
  import Link from '$lib/components/Link.svelte';
  import LausannerCard from '$lib/components/Map/LausannerCard.svelte';
  import Image from '$lib/components/Media/Image.svelte';
  import Paragraph from '$lib/components/Paragraph.svelte';
  import { getTailwindColor, isOfflineMode } from '$lib/helpers';
  import { defaultLocale, locale, t, type Locale } from '$lib/translations';
  import type { Favorite, Geolocation, Lausanner, Marker as MarkerType, Poi } from '$types';
  import { ArrowRight, MapPin, SquareArrowOutUpRight, X } from 'lucide-svelte';
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';
  import { MapLibre, Marker, NavigationControl, Popup } from 'svelte-maplibre-gl';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

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

  const markers: MarkerType[] = $state([]);
  let markerIndex: string | undefined = $state();
  let map: maplibregl.Map | undefined = $state();
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

  const handleLausannerClick = ({ favorite, poi }: { favorite: Favorite; poi: Poi }) => {
    markerIndex = `poi#${poi.id}|favorite#${favorite.id}`;

    aside.title = (poi?.name as string) ?? '';
    aside.content = favorite.content ?? '';
    aside.image = poi?.medias?.at(0) ? (poi.medias[0].cloudinary_id ?? '') : ''; // { w: 700 }
    aside.imageName = poi?.medias?.at(0)
      ? ((poi.medias[0].public_name as string | undefined) ?? '')
      : '';
    aside.imageCopyright = poi?.medias?.at(0) ? (poi.medias[0].copyright ?? '') : '';
    aside.lausanner = favorite.lausanner;
    aside.show = true;

    const geolocation = poi?.geolocations?.at(0);
    if (!geolocation) return;

    map?.flyTo({
      center: [Number(geolocation.longitude ?? ''), Number(geolocation.latitude ?? '')],
      zoom: 15,
      essential: true
    });
  };

  const closeAside = () => {
    onclose?.();
    aside.show = false;
    markerIndex = undefined;

    map?.flyTo({
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      essential: true
    });
  };

  onMount(() => {
    favorites.forEach((favorite: Favorite) => {
      const { pois, lausanner } = favorite;

      pois?.forEach((poi: Poi) => {
        poi.geolocations?.forEach((geolocation: Geolocation) => {
          markers.push({
            favorite,
            poi,
            lausanner,
            coordinates: {
              lat: parseFloat(geolocation.latitude),
              lng: parseFloat(geolocation.longitude)
            }
          });
        });
      });
    });
    console.log(favorites);
    document.documentElement.style.setProperty('--popup-color', getTailwindColor(themeColor ?? ''));
  });
</script>

<div class="relative flex h-[550px] md:flex-row 2xl:h-[768px]">
  {#if markers.length}
    <section class="map-tips z-0 h-full w-full overflow-y-hidden bg-gray-100 md:w-2/5">
      <div class={twMerge('relative h-full overflow-y-scroll p-4', aside.show ? 'hidden' : '')}>
        {#each markers as marker}
          <LausannerCard
            favorite={marker.favorite}
            poi={marker.poi}
            lausanner={marker.lausanner}
            class={listBorderColor}
            onclick={handleLausannerClick}
          />
        {/each}
      </div>
      <div
        class={twMerge('aside-popup h-full overflow-y-scroll p-4', !aside.show ? 'hidden' : '')}
        transition:fade
      >
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
    bind:map
  >
    <NavigationControl position={'top-right'} />
    {#each markers as marker}
      <Marker lnglat={marker.coordinates}>
        {#snippet content()}
          <MapPin class="stroke-brand-500 h-6 w-6 scale-90 text-transparent" strokeWidth={3} />
        {/snippet}
        <Popup
          open={markerIndex === `poi#${marker.poi.id}|favorite#${marker.favorite.id}`}
          onopen={() => {
            setTimeout(() => handleLausannerClick({ favorite: marker.favorite, poi: marker.poi }), 50);
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
          <span class="p-2 text-base text-white">{marker.poi.name}</span>
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
