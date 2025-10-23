import { extractStartEndDate } from "$lib/helpers/date";
import type { Event, Translatable } from "$types";
import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";

const event: Event<Translatable> = {
    id: 17048,
    name: {
        fr: "Astronomie: découvrez le ciel lausannois"
    },
    lead: {
        fr: "Au moyen de télescopes et en présence de moniteurs pour répondre à vos questions."
    },
    languages: ["fr"],
    highlight: false,
    schedules: {
        dates: [
            {
                label: null,
                every_year: false,
                open_days: ["su", "mo", "tu", "we", "th", "fr", "sa"],
                week: [
                    {
                        days: ["su", "mo", "tu", "we", "th", "fr", "sa"],
                        times: []
                    }
                ],
                periods: [
                    {
                        start: "2023-01-01",
                        end: "2026-01-31"
                    }
                ]
            }
        ],
        exceptions: {
            range: {
                from: "2023-01-01",
                to: "2026-01-31"
            },
            dates: []
        }
    },
    medias: [
        {
            is_cover: true,
            cloudinary_id: "9472Astronomiedecouvrezleciellausannois0",
            copyright: "© Droits réservés",
            public_name: {
                fr: "Astronomie: découvrez le ciel lausannois"
            }
        }
    ],
    seo: {
        slug: {
            fr: "astronomie-decouvrez-le-ciel-lausannois"
        },
        hreflang: {
            fr: "/fr/evenement/astronomie-decouvrez-le-ciel-lausannois"
        }
    },
    tags: [
        {
            id: 85,
            name: "Autres",
            public_name: {
                fr: "Autres",
                en: "Others",
                de: "Andere"
            }
        }
    ]
};

describe('Test extractStartEndDate', () => {
    it('extract valid period from event', () => {
        expect(extractStartEndDate(event, {
            start: "2023-01-01",
            end: undefined
        })).toEqual(
            {
                start: DateTime.fromSQL("2023-01-01"),
                end: DateTime.fromSQL("2026-01-31")
            });

        expect(extractStartEndDate(event, {
            start: "2024-01-01",
            end: undefined
        })).toEqual(
            {
                start: DateTime.fromSQL("2023-01-01"),
                end: DateTime.fromSQL("2026-01-31")
            });
    });

    it('no periods valid in event', () => {
        const expected = extractStartEndDate(event, {
            start: "2027-01-01",
            end: undefined
        })
        expect(expected).toBeUndefined();
    })
})