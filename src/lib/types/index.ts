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
