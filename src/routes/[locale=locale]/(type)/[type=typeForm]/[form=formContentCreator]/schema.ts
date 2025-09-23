import { Forms, getValues, RouteTypes, SocialNetworks, Titles, TravelReductions } from "$enums";
import { zodOptionalString, zodRequiredString } from "$lib/helpers/zod";
import { z } from 'zod/v4';

const socialNetworkEnum = z.enum(getValues(SocialNetworks));
const socialNetworkTypes = z.array(socialNetworkEnum).min(1, `${RouteTypes.Form}.validations.non-empty-array`);
const travelReductionsEnum = z.enum(getValues(TravelReductions));

export const schemaStep1 = z.object({
    contentPositioning: zodRequiredString(),
    targetAudience: zodRequiredString(),
    onlinePresence: socialNetworkTypes,
    statistics: z.object({
        instagram: z.object({
            profileURL: z.url(),
            subscriberStatisticsScreenshots: z.file().array(),
            accountsThatRespondedScreenshots: z.file().array(),
        }),
        tiktok: z.object({
            profileURL: z.url(),
            subscriberStatisticsScreenshots: z.file().array(),
        }),
        youtube: z.object({
            profileURL: z.url(),
            subscriberStatisticsScreenshots: z.file().array(),
        }),
        blog: z.object({
            url: z.url(),
            audienceProfile: zodRequiredString({ error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.statistics.${SocialNetworks.Blog}.audience-profile` }),
            performance: z.object({
                monthlyUniqueVisitors: z.number().min(1, { error: `${RouteTypes.Form}.validations.number-min-1` }).default(0),
                montlhyPageViews: z.number().default(0).nullable(),
            }),
        }),
    }).required()
})
    .superRefine((data, ctx) => {
        if (data.onlinePresence.includes(SocialNetworks.Instagram) && !data.statistics.instagram) {
            ctx.addIssue({
                code: "custom",
                message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.statistics.${SocialNetworks.Instagram}.required`
            })
        }
        if (data.onlinePresence.includes(SocialNetworks.TikTok) && !data.statistics.tiktok) {
            ctx.addIssue({
                code: "custom",
                message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.statistics.${SocialNetworks.TikTok}.required`
            })
        }
        if (data.onlinePresence.includes(SocialNetworks.YouTube) && !data.statistics.youtube) {
            ctx.addIssue({
                code: "custom",
                message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.statistics.${SocialNetworks.YouTube}.required`
            })
        }
        if (data.onlinePresence.includes(SocialNetworks.Blog) && !data.statistics.blog) {
            ctx.addIssue({
                code: "custom",
                message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.statistics.${SocialNetworks.Blog}.required`
            })
        }
    });

export const schemaStep2 = schemaStep1.safeExtend({
    coverage: z.object({
        publicationAngle: zodRequiredString(),
        subjectsOfInterest: zodRequiredString(),
        publicationChannels: socialNetworkTypes,
        proposedMediaCoverage: zodRequiredString(),
        timingAndPublicationDates: zodRequiredString(),
    }).required(),
});


export const schemaStep3 = schemaStep2.safeExtend({
    travelInformation: z.object({
        departurePoint: z.object({
            city: zodRequiredString(),
            country: zodRequiredString(),
            outwardJourney: z.string().max(300).nullable(),
        }),
        returnJourney: z.string().nullable(),
        travelReductions: z.array(travelReductionsEnum).default([]),
        lastVisit: zodRequiredString({ min: 10 }).nullable(), // last visit in lausanne or swiss
    }),
}).required();

export const schemaStep4 = schemaStep3.safeExtend({
    personalInformation: z.object({
        title: z.enum(getValues(Titles)).default(Titles.They),
        firstName: zodRequiredString(),
        lastName: zodRequiredString(),
        birthday: zodRequiredString({ min: 10 }),
        phoneNumber: zodRequiredString(),
        email: z.email().nonempty(),
        allergies: z.string().default(''),
        address: z.object({
            streetAddress: zodRequiredString(),
            city: zodRequiredString(),
            postalcode: zodRequiredString(),
            country: zodRequiredString(),
        }).required(),
        freelance: z.boolean(),
        spokenLanguages: zodRequiredString(),
        medicalAndPhysicalCondition: z.string().nullish(),
        passport: z.object({
            number: zodOptionalString(),
            validity: zodOptionalString({ min: 10 }),
        })
            .optional()
            .superRefine((data, ctx) => {
                if (data === undefined || data.number === undefined && data.validity === undefined) return; // normal case, optionnal field
                // when data not undefined fields required
                if (data.number === undefined || data.validity === undefined) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["personalInformationPassport"],
                        message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.personal-information.passport`,
                    });
                }
            }),
        emergencyContacts: z
            .array(z.object({
                name: zodRequiredString({ error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.emergency-contacts.name` }),
                phoneNumber: zodRequiredString({ error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.emergency-contacts.phone-number` }),
            }))
            .min(1, { error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.emergency-contacts.minimum` })
            .default([{
                name: '',
                phoneNumber: '',
            }]),
    }),
    travelInsuranceCoveringSwitzerland: z.boolean(),
    remarks: z.string().nullish(),
    readTermsOfAcceptance: z.boolean({ error: `${RouteTypes.Form}.validations.read-terms-of-acceptance` }),
    newsletter: z.boolean().default(true),
})
    .required()
    .superRefine((data, ctx) => {
        if (!data.readTermsOfAcceptance) {
            ctx.addIssue({
                code: "custom",
                path: ["readTermsOfAcceptance"],
                message: `${RouteTypes.Form}.validations.terms-of-acceptance`,
            });
        }
    });