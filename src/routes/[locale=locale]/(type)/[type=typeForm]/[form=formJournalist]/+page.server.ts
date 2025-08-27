import { RouteTypes, Forms } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import { z } from 'zod'
import type { EntryGenerator } from "./$types";
import countries from 'i18n-iso-countries'
import en from "i18n-iso-countries/langs/en.json";
import fr from "i18n-iso-countries/langs/fr.json";
import de from "i18n-iso-countries/langs/de.json";

const COUNTRIES: Record<string, any> = { en, fr, de };


export const load = async ({ parent }) => {
    const { locale } = await parent();
    const t = translations.get();

    countries.registerLocale(COUNTRIES[locale]);

    const MediaEnum = z.enum(["print", "online", "tv", "radio"]);
    const TravelReductionsEnum = z.enum(['Swiss GA Travel Card', 'Half-fare', 'Swiss GA Travel Card'])
    const schema = z.object({
        mediaName: z.string(),
        thematic: z.string(),
        audienceProfile: z.string(),
        mediaType: z.array(MediaEnum).nonempty(t[`${RouteTypes.Form}.validations.nonEmptyArray`]),
        printMediaStatistics: z.object({
            copies: z.number(),
            readers: z.number(),

        }),
        onlineMediaStatistics: z.object({
            website: z.string().url(),
            monthlyVisitors: z.number(),
            montlhyPageViews: z.number(),
            mediaCoverage: z.object({
                totalPages: z.number(),
                articleLength: z.string(),
                subject: z.string(),
                publishDate: z.date(),
            })
        }),
        radioAndTVMediaStatistics: z.object({
            viewers: z.number(),
        }),
        travelInformation: z.object({
            departurePoint: z.string(),
            country: z.string(),
            outwardJourney: z.string(),
            returnJourney: z.string(),
            anyReduction: z.array(TravelReductionsEnum),
        })
    })

    return {
        countries: Object.values(countries.getNames(locale, {select: "official"})).sort(),
    }
}

export const entries: EntryGenerator = () => {
    const t = translations.get();

    return supportedLocales.flatMap(locale => {
        return {
            locale,
            type: t[locale][`route.${RouteTypes.Form}.slug`],
            form: t[locale][`route.${RouteTypes.Form}.${Forms.Journalist}.slug`]
        };
    });
};