/**
 * To determine how to zoom the map to contain all the markers, we need to know the most northeast marker and the most southwest marker.
 * */

import type { Coordinates, Marker } from "$types";

function mostSWMarkers(markers: Marker[]): Coordinates
{
    const lowestLng = Math.min(
        ...markers.filter(marker => marker.coordinates.lng).map((marker) => marker.coordinates.lng)
    );
    const lowestLat = Math.min(
        ...markers.filter(marker => marker.coordinates.lat).map((marker) => marker.coordinates.lat)
    );

    return [lowestLng, lowestLat];
}

function mostNEMarkers(markers: Marker[]): Coordinates
{
    const highestLng = Math.max(
        ...markers.filter(marker => marker.coordinates.lng).map((marker) => marker.coordinates.lng)
    );
    const highestLat = Math.max(
        ...markers.filter(marker => marker.coordinates.lat).map((marker) => marker.coordinates.lat)
    );

    return [highestLng, highestLat];
}


/**
 * Given a coordinate collection, get the min-max bounds.
 * */
export function getBoundsFromMarkers(markers: Marker[]): maplibregl.LngLatBoundsLike
{
    return [
        mostSWMarkers(markers),
        mostNEMarkers(markers),
    ]
}
