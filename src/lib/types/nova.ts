import type { Geolocation } from "$types"


export type Translatable = {
    fr: string,
    en?: string,
    de?: string,
    it?: string,
    es?: string,
}

export type Video<T extends Translatable | string> = {
    id?: number,
    type?: "native" | "hosted",
    name: string,
    public_name?: T,
    poster?: Media<T>,
    url?: {
        language: "fr" | "en" | "de" | "it" | "es" | "all",
        url: string,
    },
    video?: string,
}

export type Media<T extends Translatable | string> = {
    id?: number,
    is_cover?: boolean,
    name?: string,
    public_name?: T,
    file_name?: string,
    cover?: boolean,
    cloudinary_id?: string,
    copyright?: string,
    metadata?: {
        width?: number,
        height?: number,
        mimeType?: string,
        copyright?: string,
        attr?: string,
        tags?: string,
        description?: T
    },
    mime_type?: string,
    is_in_gallery?: boolean,
    original_width: number,
    original_height: number,
    original_ratio?: string,
    seo?: Seo<T>,
    updated_at: string,
    created_at: string,
}

export type Tag<T extends Translatable | string> = {
    id?: number,
    name?: string,
    public_name?: T,
}

export type Seo<T extends Translatable | string> = {
    id?: number,
    name?: T,
    slug?: T,
    hreflang?: T,
}

export type Release<T extends Translatable | string> = {
    published_at?: string,
    id?: number,
    name?: T,
    lead?: T,
    summary?: T,
    medias?: Media<T>[],
    type?: string,
    seo?: Seo<T>,
    tags?: Tag<T>[],
    highlight?: boolean,
    content?: unknown & {
        type: string,
    }[]
}
export type Post<T extends Translatable | string> = Release<T>;
export type Page<T extends Translatable | string> = Release<T>;

export type Favorite<T extends Translatable | string> = {
    id?: number,
    lausanner?: Lausanner<T>,
    name?: string,
    content?: string,
    pois?: Poi<T>[],
    tags?: Tag<T>[],
}

export type Lausanner<T extends Translatable | string> = {
    id?: number,
    name?: string,
    languages?: string[],
    seo?: Seo<T>,
    self_intro?: string | string[],
    biography?: string | string[],
    medias?: Media<T>[],
}

export type Group<T extends Translatable | string> = {
    id?: number,
    languages?: string[],
    name?: T,
    lead?: T,
    medias?: Media<T>[],
    seo: Seo<T>,
}

export type Poi<T extends Translatable | string> = {
    id?: number,
    languages?: string[],
    name?: T,
    lead?: T,
    summary?: T,
    description?: T,
    practical?: T,
    highlight?: boolean,
    medias?: Media<T>[],
    seo?: Seo<T>,
    tags?: Tag<T>[],
    schedules?: Schedules,
    favorites?: Favorite<T>[],
    geolocations?: Geolocation[],
}
export type Event<T extends Translatable | string> = Poi<T>;

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
