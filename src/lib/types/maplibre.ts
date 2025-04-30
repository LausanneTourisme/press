import type { Favorite, Lausanner } from "$types";

export type Latitude = number;
export type Longitude = number;

export type Coordinate = {
    lat: Latitude,
    lng: Longitude,
}

export type Marker = {
    poiName: string;
    lausanner?: Lausanner;
    favorite: Favorite;
    coordinates: Coordinate;
}


export type Coordinates = [Longitude, Latitude];

export type Geolocation = {
    latitude: string,
    longitude: string,
}