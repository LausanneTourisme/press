import type { MediaType, SocialNetwork, Title, TravelReduction } from "$enums"


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
        publishDate?: string
    },
    mediaCoverageOnline: {
        articleLength?: number,
        articleThematic?: number,
        publishDate?: string
    },
    mediaCoverageTvOrRadio: {
        articleThematic?: string,
        publishDate?: string
    },
    travelInformation: {
        departurePoint: {
            city?: string,
            country?: string,
            outwardJourney?: string
        },
        returnJourney?: string,
        travelReductions: TravelReduction[],
        lastVisit?: string
    },
    personalInformation: {
        title?: Title,
        firstName?: string,
        lastName?: string,
        birthday?: string,
        phoneNumber?: string,
        email?: string,
        address: {
            streetAddress?: string,
            city?: string,
            postalcode?: string,
            country?: string
        },
        freelance?: boolean,
        spokenLanguages?: string,
        allergies?: string,
        medicalAndPhysicalCondition?: string,
        passport: {
            number?: string,
            validity?: string
        },
        emergencyContacts: { name?: string, phoneNumber?: string }[],
    },
    travelInsuranceCoveringSwitzerland?: boolean,
    remarks?: string,
    readTermsOfAcceptance?: boolean,
    newsletter?: boolean
}

export type MediaProfileContentCreator = {
    contentPositioning?: string,
    targetAudience?: string,
    onlinePresence: SocialNetwork[],
    statistics: {
        instagram?: {
            profileURL?: string,
            subscriberStatisticsScreenshots: File[],
            accountsThatRespondedScreenshots: File[],
        },
        tiktok?: {
            profileURL?: string,
            subscriberStatisticsScreenshots: File[],
        }
        youtube?: {
            profileURL: string,
            subscriberStatisticsScreenshots: File[],
        },
        blog?: {
            url?: string,
            audienceProfile?: string,
            performance?: {
                monthlyUniqueVisitors?: number,
                montlhyPageViews?: number
            }
        },
    },
    coverage: {
        publicationAngle: string,
        subjectsOfInterest: string,
        publicationChannels: SocialNetwork[],
        proposedMediaCoverage: string,
        timingAndpublicationDates: string
    },
    travelInformation: {
        departurePoint: {
            city?: string,
            country?: string,
            outwardJourney?: string
        },
        returnJourney?: string,
        travelReductions: TravelReduction[],
        lastVisit?: string
    },
    personalInformation: {
        title?: Title,
        firstName?: string,
        lastName?: string,
        birthday?: string,
        phoneNumber?: string,
        email?: string,
        address: {
            streetAddress?: string,
            city?: string,
            postalcode?: string,
            country?: string
        },
        freelance?: boolean,
        spokenLanguages?: string,
        allergies?: string,
        medicalAndPhysicalCondition?: string,
        passport: {
            number?: string,
            validity?: string
        },
        emergencyContacts: { name?: string, phoneNumber?: string }[],
    },
    travelInsuranceCoveringSwitzerland?: boolean,
    remarks?: string,
    readTermsOfAcceptance?: boolean,
    newsletter?: boolean
}