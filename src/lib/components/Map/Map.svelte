<script lang="ts">
  import { PUBLIC_CLOUDINARY_UPLOAD_PRESET, PUBLIC_MAPTILER_URL } from '$env/static/public';
  import { Cloudinary } from '$lib/cloudinary';
  import { getBoundsFromMarkers } from '$lib/coordinates';
  import { isOfflineMode } from '$lib/helpers';
  import { defaultLocale, locale, t, type Locale } from '$lib/translations';
  import type { Favorite, Geolocation, Lausanner, Marker, Poi } from '$types';
  import { ArrowRight, SquareArrowOutUpRight, X } from 'lucide-svelte';
  import maplibregl from 'maplibre-gl';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';
  import Heading from '../Heading.svelte';
  import Link from '../Link.svelte';
  import Image from '../Media/Image.svelte';
  import Paragraph from '../Paragraph.svelte';
  import LausannerCard from './LausannerCard.svelte';
  import MarkerComponent from './Marker.svelte';

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

  const { Map, NavigationControl, Popup } = maplibregl;
  let favoriteId: number | undefined = $state();
  let mapContainer: HTMLDivElement;
  const markers: Marker[] = [];
  let map: maplibregl.Map|undefined = $state();

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

  const initialState = {
    lat: 46.5197163,
    lng: 6.6309901,
    zoom: 13
  };

  const handleLausannerClick = ({
    favorite,
    lausanner,
    isMarkerClick,
  }: {
    favorite: Favorite;
    lausanner?: Lausanner;
    isMarkerClick?: boolean,
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

    const geolocation = poi?.geolocations?.at(0);
		const marker = getMarker(favorite.id);

		if (!isMarkerClick) marker?.marker?._element?.click();

		map?.flyTo({
			center: [
				Number(geolocation?.longitude ?? ''),
				Number(geolocation?.latitude ?? ''),
			],
			zoom: 15,
			essential: true
		});
  };

  const closeAside = () => {
    onclose?.();
    aside.show = false;
    // TODO
    // getMarker(favoriteId)?.popup?.remove();

    favoriteId = undefined;

    const boundsFromMarkers = getBoundsFromMarkers(markers);

    map?.fitBounds(boundsFromMarkers, {
    	padding: 20
    });
  };

  const getLausannerUrl = (lausanner: Lausanner | undefined): string => {
    if (!lausanner) return '#';

    return (
      {
        fr: 'https://www.lausanne-tourisme.ch/fr/the-lausanner/auteur/',
        en: 'https://www.lausanne-tourisme.ch/en/the-lausanner/author/',
        de: 'https://www.lausanne-tourisme.ch/de/the-lausanner/autor/'
      }[($locale as Locale) ?? defaultLocale] + lausanner.seo?.slug
    );
  };

  const getMarker = (favoriteId: undefined | number) => markers.find((m) => m.key === favoriteId);

  const markerClick = (marker: Marker) => {
		getMarker(favoriteId)?.popup?.remove();
		const favorite: Favorite = favorites.find((favorite: Favorite) => favorite.id === marker.key)!;

    handleLausannerClick({favorite, lausanner: favorite.lausanner, isMarkerClick: true})
  }

  const newPopup = ({
    id,
    background,
    img,
    title
  }: {
    id: number;
    background: string;
    img: string;
    title: string;
  }): maplibregl.Popup => {
    const popup = new Popup({ className: 'popup', closeOnClick: true }).setHTML(`
				<div data-key="${id}" class="${background} text-center max-w-[320px] rounded-l-[3px] pl-1">
						<h3 class="p-1 text-white">${title}</h3>
				</div>
			`);

    popup
      .on('open', () => {
        popup._closeButton?.addEventListener('click', closeAside);
      })
      .on('close', () => {
        aside.show = false;
        getMarker(favoriteId)?.popup?.remove();
      });

    return popup;
  };

  const mapClick = (event: MouseEvent) => {
    let target: HTMLElement | null | undefined = event.target as HTMLElement | null | undefined;

    if (!target) return;

    if (['PATH', 'SVG'].includes(target.nodeName)) {
      while (target && target.classList.contains('maplibregl-marker')) {
        target = target.parentElement as HTMLElement | null | undefined;
      }

      target?.click();
    }
  };

  onMount(() => {
    if (!favorites.length) {
      console.error('An expected error occurred while getting favorites, please refresh.');
    }

    map = new Map({
      container: mapContainer,
      style: PUBLIC_MAPTILER_URL,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom
    });

    map.addControl(new NavigationControl(), 'top-right');

    map.on('wheel', (event) => {
      if (event.originalEvent.ctrlKey) {
        // Check if CTRL key is pressed
        event.originalEvent.preventDefault(); // Prevent chrome/firefox default behavior
        if (!map?.scrollZoom._enabled) map?.scrollZoom.enable(); // Enable zoom only if it's disabled
      } else {
        if (map?.scrollZoom._enabled) map?.scrollZoom.disable(); // Disable zoom only if it's enabled
      }
    });

    favorites.forEach((favorite: Favorite) => {
      const { pois, lausanner } = favorite;

      pois?.forEach((poi: Poi) => {
        const { geolocations } = poi;
        geolocations?.forEach((geolocation: Geolocation) => {
          markers.push({
            key: favorite.id as number,
            coordinates: {
              lat: parseFloat(geolocation.latitude),
              lng: parseFloat(geolocation.longitude)
            },
            popup: newPopup({
              id: favorite.id as number,
              background: themeColor ?? '',
              img: Cloudinary.make(
                `${PUBLIC_CLOUDINARY_UPLOAD_PRESET}/${lausanner?.medias?.at(0)?.cloudinary_id}`
              ).url({ w: 60 }),
              title: poi.name as string
            }),
            backgroundColor: themeColor
          });
        });
      });
    });

    if (markers.length) {
      const boundsFromMarkers = getBoundsFromMarkers(markers);
      map.fitBounds(boundsFromMarkers, {
        padding: 20
      });
    }

    return () => map?.remove();
  });
</script>

<div class="relative flex h-[550px] flex-col-reverse md:flex-row 2xl:h-[768px]">
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
              transform={{
                g: 'north',
                c: 'auto',
                w: 48,
                h: 48
              }}
            />
            <div class="flex w-full items-center justify-between">
              <Paragraph class="ml-2 inline-flex w-1/2 text-sm font-bold md:w-2/3 md:text-base">
                <Link
                  withIcon={true}
                  href={getLausannerUrl(aside.lausanner)}
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
  <!--display map without lausanners if problem on loading-->
  <section
    class="map-wrap relative h-full w-full {favorites.length ? 'md:w-3/5' : ''} my-2 md:my-0 overflow-hidden"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div id="map" class="h-full w-full" bind:this={mapContainer} onclick={mapClick}></div>
  </section>
</div>

{#if map}
  {#each markers as marker }
    <MarkerComponent {marker} {map} onclick={markerClick}/>
  {/each}
{/if}
