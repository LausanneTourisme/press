import type { Locale } from "$lib/translations";
import type { Component  } from "svelte";

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

export type Translatable = {
    fr: string,
    en?: string,
    de?: string,
    it?: string,
    es?: string,
}

export type Media = {
    id: number,
    is_cover?: boolean,
    name: string,
    public_name: Translatable,
    cover: boolean,
    cloudinary_id: string,
    copyright: string,
    metadata: object,
}

export type Tag = {
    id: number,
    name: string,
    public_name: string,
}

export type Seo = {
    id: number,
    name: string,
    slug: string,
    hreflang: string,
}

export type Release = {
    published_at: string,
    id: number,
    name: Translatable,
    lead: Translatable,
    summary: Translatable,
    medias: Media[],
    type: string,
    seo: Seo,
    tags: Tag[],
    highlight: boolean,
}
export type Post = Release;
export type Page = Release;