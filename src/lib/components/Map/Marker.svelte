<script lang="ts">
  import type { Marker as MarkerType } from '$types';
  import { MapPin } from 'lucide-svelte';
  import maplibre from 'maplibre-gl';
  import { onMount } from 'svelte';
  import { getTailwindColor } from '$lib/helpers';

  const { Marker } = maplibre;

  type Props = {
    class?: string;
    map: maplibregl.Map;
    marker: MarkerType;
    onclick?: (marker: MarkerType) => void;
    onadd?: (marker: MarkerType) => void;
  };

  const { class: additionalClass, marker, map, onclick, onadd }: Props = $props();
  const { lng, lat } = marker.coordinates;

  let pinElement: HTMLDivElement;

  const add = (marker: MarkerType) => {
    marker.marker = new Marker({ element: pinElement })
      .setLngLat({ lng, lat })
      .setPopup(marker.popup)
      .addTo(map);

    onadd?.(marker);
  };

  const handleClick = (event: Event) => {
    map.flyTo({
      center: [lng, lat],
      essential: true
    });

    onclick?.(marker);
  };

  onMount(() => {
    document.documentElement.style.setProperty(
      '--popup-color',
      getTailwindColor(marker.backgroundColor ?? '')
    );
    add(marker);

    return () => {
      marker.marker?.remove();
    };
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div bind:this={pinElement} onclick={handleClick}>
  <MapPin class="stroke-brand-500 h-6 w-6 scale-90 text-transparent" strokeWidth={3} />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  :global(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
    border-top-color: var(--popup-color);
  }
  :global(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
    border-right-color: var(--popup-color);
  }
  :global(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
    border-left-color: var(--popup-color);
  }
  :global(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
    border-bottom-color: var(--popup-color);
  }

  :global(.maplibregl-popup-content) {
    display: flex;
    background-color: var(--popup-color);
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    @reference p-0;
  }

  :global(.maplibregl-popup-content button) {
    position: unset;
    width: 20px;
  }
  :global(.maplibregl-popup-content h3) {
    @reference font-euclid font-bold md:text-base;
  }
</style>
