import type { MediaType, TravelReduction } from "$enums";
import type { Locale } from "$lib/translations";
import type { Component } from "svelte";

export type * from './maplibre';
export type * from './nova';
export type * from './images'

declare global {
    interface Window {
        dataLayer: unknown[];
    }
}

export type SelectedDates = { start: string, end: string | undefined | null };
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
    },
    errors?: unknown[]
}

export type MediaProfileJournalist = {
    mediaName?: string,
    thematic?: string,
    audienceProfile?: string,
    mediaTypes: MediaType[],
    printMediaStatistics: {
      copies?: number,
      readers?: number,
      broadcastLocation?: string
    },
    radioAndTVMediaStatistics: {
      emissionName?: string,
      viewers?: number
    },
    onlineMediaStatistics: {
      website?: string,
      monthlyUniqueVisitors?: number,
      montlhyPageViews?: number
    },
    mediaCoveragePrint: {
      totalPages?: number,
      articleLength?: number,
      publishDate?: Date
    },
    mediaCoverageOnline: {
      articleLength?: number,
      articleThematic?: number,
      publishDate?: Date
    },
    mediaCoverageTvOrRadio: {
      articleThematic?: string,
      publishDate?: Date
    },
    travelInformation: {
      departurePoint: {
        city?: string,
        country?: string,
        outwardJourney?: string
      },
      returnJourney?: string,
      anyReduction?: TravelReduction[],
      lastVisit?: Date
    },
    personalInformation: {
      title?: string,
      firstName?: string,
      lastName?: string,
      birthday?: Date,
      phoneNumber?: string,
      email?: string,
      address: {
        address?: string,
        city?: string,
        postalcode?: string,
        country?: string
      },
      freelance?: boolean,
      spokenLanguages?: string,
      medicalAndPhysicalCondition?: string,
      passport: {
        number?: string,
        validity?: Date
      },
      emergencyContacts: {name: string, phoneNumber: string}[],
    },
    travelInsuranceCoveringSwitzerland?: boolean,
    remarks?: string,
    readTermsOfAcceptance?: boolean,
    newsletter?: boolean
  }