import { Forms, getValues, RouteTypes, SocialNetworks, Titles, TravelReductions } from "$enums";
import { zodRequiredString } from "$lib/helpers/zod";
import { z } from 'zod/v4';

const socialNetworkEnum = z.enum(getValues(SocialNetworks));
const socialNetworkTypes = z.array(socialNetworkEnum).min(1, `${RouteTypes.Form}.validations.non-empty-array`);
const travelReductionsEnum = z.enum(getValues(TravelReductions));
const allowedMimeTypes = [
    // Image types
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
];
const fileSchema = z.instanceof(File)
    .refine((file) => file.size > 0, `${RouteTypes.Form}.validations.file-size`)
    .refine((file) => file.size <= 10 * 1024 * 1024, `${RouteTypes.Form}.validations.file-size`)
    .refine((file) => allowedMimeTypes.includes(file.type), `${RouteTypes.Form}.validations.file-invalid-type`);

export const schemaStep1 = z.object({
    contentPositioning: zodRequiredString(),
    targetAudience: zodRequiredString(),
    onlinePresence: socialNetworkTypes.default([]),

    // Instagram (optional)
    instagramProfileURL: z.url().nullish(),
    instagramSubscriberScreenshots: z.array(fileSchema).default([]),
    instagramAccountsScreenshots: z.array(fileSchema).default([]),

    // TikTok (optional)
    tiktokProfileURL: z.url().nullish(),
    tiktokSubscriberScreenshots: z.array(fileSchema).default([]),

    // YouTube (optional)
    youtubeProfileURL: z.url().nullish(),
    youtubeSubscriberScreenshots: z.array(fileSchema).default([]),

    // Blog (optional)
    blogURL: z.url().nullish(),
    blogAudienceProfile: z.string().nullish(),
    blogMonthlyUniqueVisitors: z.number().nullish(),
    blogMonthlyPageViews: z.number().nullish(),
})
    .superRefine((data, ctx) => {
        if (data.onlinePresence.includes(SocialNetworks.Instagram)) {
            if (!data.instagramAccountsScreenshots?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["instagramAccountsScreenshots"],
                    message: "Instagram statistics required"
                });
            }
            if (!data.instagramSubscriberScreenshots?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["instagramSubscriberScreenshots"],
                    message: "Instagram statistics required"
                });
            }
            if (!data.instagramProfileURL) {
                ctx.addIssue({
                    code: "custom",
                    path: ["instagramProfileURL"],
                    message: "Instagram statistics required"
                });
            }
        }
        if (data.onlinePresence.includes(SocialNetworks.TikTok)) {
            if (!data.tiktokProfileURL) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tiktokProfileURL"],
                    message: "TikTok statistics required"
                });
            }
            if (!data.tiktokSubscriberScreenshots?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["tiktokSubscriberScreenshots"],
                    message: "TikTok statistics required"
                });
            }
        }
        if (data.onlinePresence.includes(SocialNetworks.YouTube)) {
            if (!data.youtubeProfileURL) {
                ctx.addIssue({
                    code: "custom",
                    path: ["youtubeProfileURL"],
                    message: "Youtube statistics required"
                });
            }
            if (!data.youtubeSubscriberScreenshots?.length) {
                ctx.addIssue({
                    code: "custom",
                    path: ["youtubeSubscriberScreenshots"],
                    message: "Youtube statistics required"
                });
            }
        }
        if (data.onlinePresence.includes(SocialNetworks.Blog)) {
            if (!data.blogAudienceProfile) {
                ctx.addIssue({
                    code: "custom",
                    path: ["blogAudienceProfile"],
                    message: "Blog statistics required"
                });
            }
            if (!data.blogMonthlyPageViews) {
                ctx.addIssue({
                    code: "custom",
                    path: ["blogMonthlyPageViews"],
                    message: "Blog statistics required"
                });
            }
            if (!data.blogMonthlyUniqueVisitors) {
                ctx.addIssue({
                    code: "custom",
                    path: ["blogMonthlyUniqueVisitors"],
                    message: "Blog statistics required"
                });
            }
            if (!data.blogURL) {
                ctx.addIssue({
                    code: "custom",
                    path: ["blogURL"],
                    message: "Blog statistics required"
                });
            }
        }
    });

export const schemaStep2 = schemaStep1.safeExtend({
    coveragePublicationAngle: zodRequiredString(),
    coverageSubjectsOfInterest: zodRequiredString(),
    coveragePublicationChannels: socialNetworkTypes.min(1).default([]),
    coverageProposedMediaCoverage: zodRequiredString(),
    coverageTimingAndPublicationDates: zodRequiredString(),
});


export const schemaStep3 = schemaStep2.safeExtend({
    travelDepartureCity: zodRequiredString(),
    travelDepartureCountry: zodRequiredString(),
    travelOutwardJourney: z.string().max(300).optional().nullable().nullish(),
    travelReturnJourney: z.string().nullish().optional(),
    travelReductions: z.array(travelReductionsEnum).default([]).optional(),
    travelLastVisit: z.string().nullish(),
}).required();

export const schemaStep4 = schemaStep3.safeExtend({
    personalTitle: z.enum(getValues(Titles)).default(Titles.They).nonoptional(),
    personalFirstName: zodRequiredString(),
    personalLastName: zodRequiredString(),
    personalBirthday: zodRequiredString({ min: 10 }),
    personalPhoneNumber: zodRequiredString(),
    personalEmail: z.email().nonempty().nonoptional(),
    personalSpokenLanguages: zodRequiredString(),
    personalAllergies: z.string().nullish(),
    personalMedicalCondition: z.string().nullish(),

    // Address
    addressStreetAddress: zodRequiredString(),
    addressCity: zodRequiredString(),
    addressPostalCode: zodRequiredString(),
    addressCountry: zodRequiredString(),

    // Passport
    passportNumber: z.string().nullish().nullable(),
    passportValidity: z.string().nullish().nullable(),

    emergencyContactNames: z.array(zodRequiredString()).min(1, { error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.emergency-contacts.name` }),
    emergencyContactPhones: z.array(zodRequiredString()).min(1, { error: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.emergency-contacts.phone-number` }),

    travelInsuranceCoveringSwitzerland: z.boolean(),
    remarks: z.string().nullish(),
    readTermsOfAcceptance: z.boolean({ error: `${RouteTypes.Form}.validations.read-terms-of-acceptance` }),
    newsletter: z.boolean().default(true),
})
    .required()
    .superRefine((data, ctx) => {

        // Either both passport fields or neither
        const hasNumber = Number(data.passportNumber?.length) > 2;
        const hasValidity = Number(data.passportValidity?.length) > 2;

        if (
            hasNumber !== hasValidity ||
            data.passportNumber && (data.passportNumber.trim() === "" || !hasNumber) ||
            data.passportValidity && (data.passportValidity.trim() === "" || !hasValidity))  {
            ctx.addIssue({
                code: "custom",
                path: ["personalInformationPassport"],
                message: `${RouteTypes.Form}.${Forms.ContentCreator}.validations.personal-information.passport`,
            });
        }

        // The two fields go hand in hand!
        if (data.emergencyContactNames.length !== data.emergencyContactPhones.length) {
            ctx.addIssue({
                code: "custom",
                path: ["emergencyContacts"],
            });
        }

        // emergency name or phone can't be empty
        data.emergencyContactNames.forEach((_, index) => {
            if (data.emergencyContactNames[index] === "" || data.emergencyContactNames[index] === undefined ) {
                ctx.addIssue({
                    code: "custom",
                    path: [`emergencyContactNames_${index}`],
                });
            }
            if ( data.emergencyContactPhones[index] === "" || data.emergencyContactPhones[index] === undefined) {
                ctx.addIssue({
                    code: "custom",
                    path: [`emergencyContactPhones_${index}`],
                });
            }
        })

        // user should read terms !
        if (!data.readTermsOfAcceptance) {
            ctx.addIssue({
                code: "custom",
                path: ["readTermsOfAcceptance"],
                message: `${RouteTypes.Form}.validations.terms-of-acceptance`,
            });
        }
    });

export type Schema = z.infer<typeof schemaStep4>;