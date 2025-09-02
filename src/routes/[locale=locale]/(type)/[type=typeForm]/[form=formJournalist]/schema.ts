
import { Forms, Genders, getValues, MediaTypes, RouteTypes, TravelReductions } from "$enums";
import { zodOptionalString, zodRequiredString } from "$lib/helpers/zod";
import { z } from 'zod';

const mediaEnum = z.enum(getValues(MediaTypes));
const travelReductionsEnum = z.enum(getValues(TravelReductions));

export const mediaTypes = z.array(mediaEnum).nonempty(`${RouteTypes.Form}.validations.non-empty-array`);

// required when media type is "print" (via superRefine)
export const printMediaStatistics = z.object({
    copies: z.number().default(0),
    readers: z.number().default(0),
    broadcastLocation: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.broadcast-location` })
}).refine(({ copies, readers }) => {
    if (copies === 0) {
        return readers > 0
    }
    if (readers === 0) {
        return copies > 0
    }
    return true;
}, {
    path: ['printMediaStatistics'],
    message: `${RouteTypes.Form}.${Forms.Journalist}.validations.print-media-statistics`
})
    .nullish();

// required when media type is "radio" or "tv" (via superRefine)
export const radioAndTVMediaStatistics = z.object({
    emissionName: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.emission-name` }),
    viewers: z.number().min(1),
})
    .nullish();

// required when media type is "online" (via superRefine)
export const onlineMediaStatistics = z.object({
    website: z.string().url(),
    monthlyUniqueVisitors: z.number().min(1),
    montlhyPageViews: z.number().nullish(),
})
    .nullish();

//required when media type is "print" (via superRefine)
export const mediaCoveragePrint = z.object({
    totalPages: z.number().nullish(),
    articleLength: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-length` }),
    publishDate: z.date() // faire si possible que choix année / mois, si date précise ils peuvent la mettre
})
    .nullish();

//required when media type is "online" (via superRefine)
export const mediaCoverageOnline = z.object({
    articleLength: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-length` }),
    articleThematic: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-themactic` }),
    publishDate: z.date() // faire si possible que choix année / mois, si date précise ils peuvent la mettre
})
    .nullish();

//required when media type is "tv" or "radio" (via superRefine)
export const mediaCoverageTvOrRadio = z.object({
    articleThematic: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-themactic` }),
    publishDate: z.date() // faire si possible que choix année / mois, si date précise ils peuvent la mettre
})
    .nullish();

export const travelInformation = z.object({
    departurePoint: z.object({
        city: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.travel-information.city` }),
        country: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.travel-information.country` }),
        outwardJourney: z.string().nullish(),
    }),
    returnJourney: z.string().nullish(),
    anyReduction: z.array(travelReductionsEnum).nullish(),
    lastVisit: z.date().nullish(), // last visit in lausanne or swiss
}).required();

export const personalInformation = z.object({
    title: z.enum(getValues(Genders)),
    firstName: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.first-name` }),
    lastName: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.last-name` }),
    birthday: z.date(),
    phoneNumber: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.phone-number` }),
    email: z.string().email().nonempty(),
    address: z.object({
        address: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.address` }),
        city: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.city` }),
        postalcode: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.country` }),
        country: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.postal-code` }),
    }).required(),
    freelance: z.boolean(),
    spokenLanguages: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.spoken-languages` }),
    medicalAndPhysicalCondition: z.string().nullish(),
    passport: z.object({
        number: zodOptionalString(),
        validity: z.date().optional(),
    }).optional(),
    emergencyContacts: z.array(z.object({
        name: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.name` }),
        phoneNumber: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.phone-number` }),
    })).min(1, { message: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.minimum` }),
}).required();

export const schemaStep1 = z.object({
    mediaName: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-name` }),
    thematic: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.thematic` }),
    audienceProfile: zodRequiredString({ message: `${RouteTypes.Form}.${Forms.Journalist}.validations.audience-profile` }),
    mediaTypes: mediaTypes,
    printMediaStatistics: printMediaStatistics,
    radioAndTVMediaStatistics: radioAndTVMediaStatistics,
    onlineMediaStatistics: onlineMediaStatistics,
}).required();

export const schemaStep1Refined = schemaStep1
    .superRefine((data, ctx) => {
        if (data.mediaTypes.includes(MediaTypes.Print) && !data.printMediaStatistics) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["printMediaStatistics"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }

        if ([MediaTypes.Radio, MediaTypes.Tv].some(requiredType => data.mediaTypes.includes(requiredType)) && !data.radioAndTVMediaStatistics) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["radioAndTVMediaStatistics"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }

        if (data.mediaTypes.includes(MediaTypes.Online) && !data.onlineMediaStatistics) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["onlineMediaStatistics"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }
    });

export const schemaStep2 = schemaStep1.extend({
    mediaCoveragePrint: mediaCoveragePrint,
    mediaCoverageOnline: mediaCoverageOnline,
    mediaCoverageTvOrRadio: mediaCoverageTvOrRadio,
})
    .required();

export const schemaStep2Refined = schemaStep2
    .superRefine((data, ctx) => {
        if (data.mediaTypes.includes(MediaTypes.Print) && !data.mediaCoveragePrint) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mediaCoveragePrint"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }

        if ([MediaTypes.Radio, MediaTypes.Tv].some(requiredType => data.mediaTypes.includes(requiredType)) && !data.mediaCoverageTvOrRadio) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mediaCoverageTvOrRadio"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }

        if (data.mediaTypes.includes(MediaTypes.Online) && !data.mediaCoverageOnline) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["mediaCoverageOnline"],
                message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
            });
        }
    });

export const schemaStep3 = schemaStep2
    .extend({
        travelInformation: travelInformation,
    });

export const schemaStep4 = schemaStep3
    .extend({
        personalInformation: personalInformation,
        travelInsuranceCoveringSwitzerland: z.boolean(),
        remarks: z.string().nullish(),
        readTermsOfAcceptance: z.literal<boolean>(true, { errorMap: () => ({ message: `${RouteTypes.Form}.validations.read-terms-of-acceptance` }) }),
        newsletter: z.boolean(),
    });

// export const completeSchema = z.object({
//     mediaName: z.string(),
//     thematic: z.string(),
//     audienceProfile: z.string(),
//     mediaType: mediaType,
//     printMediaStatistics: printMediaStatistics,
//     radioAndTVMediaStatistics: radioAndTVMediaStatistics,
//     onlineMediaStatistics: onlineMediaStatistics,
//     mediaCoveragePrint: mediaCoveragePrint,
//     mediaCoverageOnline: mediaCoverageOnline,
//     mediaCoverageTvOrRadio: mediaCoverageTvOrRadio,
//     travelInformation: travelInformation,
//     personalInformation: personalInformation,
//     travelInsuranceCoveringSwitzerland: z.boolean(),
//     remarks: z.string().nullish(),
//     readTermsOfAcceptance: z.literal<boolean>(true, { errorMap: () => ({ message: `${RouteTypes.Form}.validations.read-terms-of-acceptance` }) }),
//     newsletter: z.boolean(),
// })
//     .required()
//     .superRefine((data, ctx) => {
//         if (data.mediaType.includes(MediaTypes.Print) && !data.printMediaStatistics) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["printMediaStatistics"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }

//         if ([MediaTypes.Radio, MediaTypes.Tv].some(requiredType => data.mediaType.includes(requiredType)) && !data.radioAndTVMediaStatistics) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["radioAndTVMediaStatistics"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }

//         if (data.mediaType.includes(MediaTypes.Online) && !data.onlineMediaStatistics) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["onlineMediaStatistics"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }

//         if (data.mediaType.includes(MediaTypes.Print) && !data.mediaCoveragePrint) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["mediaCoveragePrint"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }

//         if ([MediaTypes.Radio, MediaTypes.Tv].some(requiredType => data.mediaType.includes(requiredType)) && !data.mediaCoverageTvOrRadio) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["mediaCoverageTvOrRadio"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }

//         if (data.mediaType.includes(MediaTypes.Online) && !data.mediaCoverageOnline) {
//             ctx.addIssue({
//                 code: z.ZodIssueCode.custom,
//                 path: ["mediaCoverageOnline"],
//                 message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`,
//             });
//         }
//     });