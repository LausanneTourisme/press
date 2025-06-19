import type { Favorite, Lausanner, Poi, Translatable } from "$types";

export type Latitude = number;
export type Longitude = number;

export type Coordinate = {
    lat: Latitude,
    lng: Longitude,
}

export type Marker<T extends Translatable | string> = {
    poi: Poi<T>;
    lausanner?: Lausanner<T>;
    favorite: Favorite<T>;
    coordinates: Coordinate;
}


export type Coordinates = [Longitude, Latitude];

export type Geolocation = {
    latitude: string,
    longitude: string,
}