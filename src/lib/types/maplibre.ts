import type { Favorite, Lausanner, Poi } from "$types";

export type Latitude = number;
export type Longitude = number;

export type Coordinate = {
    lat: Latitude,
    lng: Longitude,
}

export type Marker = {
    poi: Poi;
    lausanner?: Lausanner;
    favorite: Favorite;
    coordinates: Coordinate;
}


export type Coordinates = [Longitude, Latitude];

export type Geolocation = {
    latitude: string,
    longitude: string,
}