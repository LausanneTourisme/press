import maplibregl from "maplibre-gl";

export type Latitude = number;
export type Longitude = number;

export type Coordinate = {
    lat: Latitude,
    lng: Longitude,
}

export type Marker = {
    key: number,
    coordinates: Coordinate,
    popup: Popup,
    marker?: maplibregl.Marker,
    backgroundColor: undefined|string,
}

export type Coordinates = [Longitude, Latitude];

export type Geolocation = {
    latitude: string,
    longitude: string,
}

export type Popup = maplibregl.Popup