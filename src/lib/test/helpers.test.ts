import { extractStartEndDate, isSameDays } from "$lib/helpers/date";
import type { Event, Translatable } from "$types";
import { DateTime } from "luxon";
import { beforeEach, describe, expect, it } from "vitest";


describe('Test all dates helpers', () => {
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
        schedules: undefined,
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

    //reset dates
    beforeEach(() => {
        event.schedules = {
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
                            end: "2024-12-31"
                        },
                        {
                            start: "2025-01-01",
                            end: "2025-12-31"
                        },
                        {
                            start: "2027-01-01",
                            end: "2027-06-29"
                        },
                        {
                            start: "2027-06-30",
                            end: "2027-06-30"
                        },
                    ]
                }
            ],
            exceptions: {
                range: {
                    from: "2023-01-01",
                    to: "2027-06-30"
                },
                dates: []
            }
        }
    })

    describe('Test extractStartEndDate', () => {
        it('returns first period', () => {
            expect(extractStartEndDate(event, {
                start: "2020-01-01",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2023-01-01"),
                    end: DateTime.fromSQL("2024-12-31")
                });

            expect(extractStartEndDate(event, {
                start: "2024-01-01",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2023-01-01"),
                    end: DateTime.fromSQL("2024-12-31")
                });

            expect(extractStartEndDate(event, {
                start: "2024-12-31",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2023-01-01"),
                    end: DateTime.fromSQL("2024-12-31")
                });

            expect(extractStartEndDate(event, {
                start: "2024-01-01",
                end: "2025-12-31"
            })).toEqual(
                {
                    start: DateTime.fromSQL("2023-01-01"),
                    end: DateTime.fromSQL("2024-12-31")
                });
        });

        it('returns second period', () => {
            expect(extractStartEndDate(event, {
                start: "2025-01-01",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2025-01-01"),
                    end: DateTime.fromSQL("2025-12-31")
                });

            expect(extractStartEndDate(event, {
                start: "2025-01-01",
                end: "2025-12-31"
            })).toEqual(
                {
                    start: DateTime.fromSQL("2025-01-01"),
                    end: DateTime.fromSQL("2025-12-31")
                });

            expect(extractStartEndDate(event, {
                start: "2025-06-20",
                end: undefined,
            })).toEqual(
                {
                    start: DateTime.fromSQL("2025-01-01"),
                    end: DateTime.fromSQL("2025-12-31")
                });
        });

        it('returns third period', () => {
            expect(extractStartEndDate(event, {
                start: "2026-01-01",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2027-01-01"),
                    end: DateTime.fromSQL("2027-06-29")
                });

            expect(extractStartEndDate(event, {
                start: "2026-12-31",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2027-01-01"),
                    end: DateTime.fromSQL("2027-06-29")
                });

            expect(extractStartEndDate(event, {
                start: "2026-12-31",
                end: "2030-12-31"
            })).toEqual(
                {
                    start: DateTime.fromSQL("2027-01-01"),
                    end: DateTime.fromSQL("2027-06-29")
                });
        });

        it('returns last period', () => {
            expect(extractStartEndDate(event, {
                start: "2027-06-30",
                end: undefined
            })).toEqual(
                {
                    start: DateTime.fromSQL("2027-06-30"),
                    end: DateTime.fromSQL("2027-06-30")
                });

            expect(extractStartEndDate(event, {
                start: "2027-06-30",
                end: "2027-06-30"
            })).toEqual(
                {
                    start: DateTime.fromSQL("2027-06-30"),
                    end: DateTime.fromSQL("2027-06-30")
                });
        });

        it('returns undefined on invalid periods', () => {
            expect(extractStartEndDate(event, {
                start: "2030-01-01",
                end: undefined
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2020-01-01",
                end: "2022-12-31"
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2023-01-01",
                end: "2022-12-31"
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2026-01-01",
                end: "2026-12-31"
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2027-07-01",
                end: undefined,
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2027-07-01",
                end: "2027-01-01",
            })).toBeUndefined();

            expect(extractStartEndDate(event, {
                start: "2027-07-01",
                end: "2030-12-31",
            })).toBeUndefined();
        });
    });

    // describe('Test isSameDays', () => {
    //     it('is same day', () => {
    //         expect(isSameDays(event, { start: '2023-01-01', end: undefined })).toBeTruthy()
    //     })
    // });
})