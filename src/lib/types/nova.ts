import type { Geolocation } from "$types"


export type Translatable = {
    fr: string,
    en?: string,
    de?: string,
    it?: string,
    es?: string,
}

export type Media = {
    id?: number,
    is_cover?: boolean,
    name?: string,
    public_name?: Translatable | string,
    cover?: boolean,
    cloudinary_id?: string,
    copyright?: string,
    metadata?: object,
}

export type Tag = {
    id?: number,
    name?: string,
    public_name?: string,
}

export type Seo = {
    id?: number,
    name?: string|Translatable,
    slug?: string|Translatable,
    hreflang?: string|Translatable,
}

export type Release = {
    published_at?: string,
    id?: number,
    name?: Translatable | string,
    lead?: Translatable | string,
    summary?: Translatable | string,
    medias?: Media[],
    type?: string,
    seo?: Seo,
    tags?: Tag[],
    highlight?: boolean,
}
export type Post = Release;
export type Page = Release;

export type Favorite = {
    id?: number,
    lausanner?: Lausanner,
    name?: string,
    content?: string,
    pois?: Poi[],
    tags?: Tag[],
}

export type Lausanner = {
    id?: number,
    name?: string,
    languages?: string[],
    seo?: Seo,
    self_intro?: string | string[],
    biography?: string | string[],
    medias?: Media[],
}

export type Group = {
    id?: number,
    languages?: string[],
    name?: Translatable | string,
    lead?: Translatable | string,
    medias?: Media[],
    seo: Seo,
}

export type Poi = {
    id?: number,
    languages?: string[],
    name?: Translatable | string,
    lead?: Translatable | string,
    summary?: Translatable | string,
    description?: Translatable | string,
    practical?: Translatable | string,
    highlight?: boolean,
    medias?: Media[],
    seo?: Seo,
    tags?: Tag[],
    schedules?: Schedules,
    favorites?: Favorite[],
    geolocations?: Geolocation[],
}
export type Event = Poi;

export type Schedules = {
    dates?: ScheduleDate[],
    exceptions?: {
        range?: Range,
        dates?: ExceptionDate[] | null | undefined
    }
}

export type ScheduleDate = {
    label?: string | null | undefined,
    every_year?: boolean,
    open_days?: ShortDay[],
    week?: Week[],
    periods?: Period[]
}

export type ExceptionDate = {
    start?: `${YYYY}-${MM}-${DD}`,
    end?: `${YYYY}-${MM}-${DD}`,
    type?: "closed" | "modified",
    open_days?: ShortDay[],
    week?: Week[]
}

export type Week = {
    days?: ShortDay[],
    times?: Time[] | null | undefined,
}

export type Period = {
    start?: RawDate,
    end?: RawDate,
}

export type Time = {
    start?: `${HH}:${mm}`,
    end?: `${HH}:${mm}` | null | undefined,
}

export type RawDate = `${YYYY}-${MM}-${DD}`
export type ShortDay = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su";

type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

type zeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

type zeroToFive = 0 | 1 | 2 | 3 | 4 | 5

/**
 * Years
 */
type YYYY = `20${zeroToNine}${zeroToNine}`

/**
 * Months
 */
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`

/**
 * Days
 */
type DD = `${0}${oneToNine}` | `${1 | 2}${zeroToNine}` | `3${0 | 1}`

/**
 * Hours
 */
type HH = `${0 | 1}${zeroToNine}` | zeroToNine | `20` | `21` | `22` | `23`;

/**
 * Minutes
 */
type mm = `${zeroToFive}${zeroToNine}`
