import type { SvelteComponent } from "svelte";

export type MenuItem = {
    title: string,
    link?: string,
    anchor?: string,
    icon?: SvelteComponent,
}

export type Menu = MenuItem & {
    items?: MenuItem[]
}