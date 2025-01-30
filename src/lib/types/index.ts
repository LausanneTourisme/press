import type { Locale } from "$lib/translations";
import type { SvelteComponent } from "svelte";

export type MenuItem = {
    title: string,
    link?: string,
    anchor?: string,
    icon?: SvelteComponent
}

export type Menu = MenuItem & {
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
