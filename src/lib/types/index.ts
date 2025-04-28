import type { Locale } from "$lib/translations";
import type { Component } from "svelte";
import type { Event, Favorite, Group, Lausanner, Media, Page, Poi, Post, Release, Tag } from "./nova";
import maplibregl from "maplibre-gl";

export type * from './nova';

export type MaybePromise<T> = T | Promise<T> | PromiseLike<T>;

export type MenuItem = {
    title: string,
    link: string,
    icon?: Component,
    strokeWidth?: number,
}

export type Menu = {
    title: string,
    link?: string,
    items?: MenuItem[]
}

export type SeoHeader = {
    canonical: string,
    title: string,
    description: string,
    image: string,
    alternate: SeoAlternate[]
}

export type SeoAlternate = {
    hreflang: Locale,
    href: string
}

export type GraphQLResponse<T> = {
    data: {
        items?: {
            has_more_pages: boolean,
            current_page: number,
            last_page: number,
            per_page: number,
            from: number,
            to: number,
            total: number,
            data: T[],
        },
        item?: T
    }
}

export type Marker = {
    key: number,
    coordinates: Coordinate,
    popup: Popup,
    marker?: maplibregl.Marker,
    backgroundColor: undefined|string,
}

export type Latitude = number;
export type Longitude = number;

export type Coordinate = {
    lat: Latitude,
    lng: Longitude,
}
export type Coordinates = [Longitude, Latitude];

export type Geolocation = {
    latitude: string,
    longitude: string,
}

export type Popup = maplibregl.Popup