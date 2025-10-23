import { Forms, Titles, getValues, MediaTypes, RouteTypes, TravelReductions } from '$enums';
import { zodOptionalString, zodRequiredString } from '$lib/helpers/zod';
import { z } from 'zod/v4';

const mediaEnum = z.enum(getValues(MediaTypes));
const travelReductionsEnum = z.enum(getValues(TravelReductions));

const mediaTypes = z.array(mediaEnum).min(1, `${RouteTypes.Form}.validations.non-empty-array`);

// required when media type is "print" (via superRefine)
export const printMediaStatistics = z
  .object({
    copies: z.number().positive().default(0),
    readers: z.number().positive().default(0),
    broadcastLocation: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.broadcast-location`
    }).default('')
  })
  .refine(
    ({ copies, readers }) => {
      if (copies === 0 && readers > 0) {
        return true;
      }
      if (copies > 0 && readers === 0) {
        return true;
      }
      if (readers > 0 && copies > 0) {
        return true;
      }
      return false;
    },
    {
      path: ['printMediaStatistics'],
      message: `${RouteTypes.Form}.${Forms.Journalist}.validations.print-media-statistics`
    }
  )
  .nullable();

// required when media type is "radio" or "tv" (via superRefine)
export const radioAndTVMediaStatistics = z
  .object({
    emissionName: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.emission-name`
    }).default(''),
    viewers: z.number().positive().min(1).default(0)
  })
  .nullable();

// required when media type is "online" (via superRefine)
export const onlineMediaStatistics = z
  .object({
    website: z.url(),
    monthlyUniqueVisitors: z
      .number()
      .positive()
      .min(1, { error: `${RouteTypes.Form}.validations.number-min-1` })
      .default(0),
    montlhyPageViews: z.number().positive().default(0).nullable()
  })
  .nullable();

//required when media type is "print" (via superRefine)
export const mediaCoveragePrint = z
  .object({
    totalPages: z.number().positive().min(1).default(0),
    articleLength: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-length`
    }).default(''),
    publishDate: zodRequiredString({ min: 10 })
  })
  .nullable();

//required when media type is "online" (via superRefine)
export const mediaCoverageOnline = z
  .object({
    articleLength: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-length`
    }).default(''),
    articleThematic: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-themactic`
    }).default(''),
    publishDate: zodRequiredString({ min: 10 }) // faire si possible que choix année / mois, si date précise ils peuvent la mettre
  })
  .nullable();

//required when media type is "tv" or "radio" (via superRefine)
export const mediaCoverageTvOrRadio = z
  .object({
    articleThematic: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.article-themactic`
    }),
    publishDate: zodRequiredString({ min: 10 }) // faire si possible que choix année / mois, si date précise ils peuvent la mettre
  })
  .nullable();

export const travelInformation = z
  .object({
    departurePoint: z.object({
      city: zodRequiredString({
        error: `${RouteTypes.Form}.${Forms.Journalist}.validations.travel-information.city`
      }),
      country: zodRequiredString({
        error: `${RouteTypes.Form}.${Forms.Journalist}.validations.travel-information.country`
      }),
      outwardJourney: z.string().max(300).nullable()
    }),
    returnJourney: z.string().nullable(),
    travelReductions: z.array(travelReductionsEnum).default([]),
    lastVisit: zodRequiredString({ min: 10 }).nullable() // last visit in lausanne or swiss
  })
  .required();

export const personalInformation = z
  .object({
    title: z.enum(getValues(Titles)).default(Titles.They),
    firstName: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.first-name`
    }),
    lastName: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.last-name`
    }),
    birthday: zodRequiredString({ min: 10 }),
    phoneNumber: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.phone-number`
    }),
    email: z.email().nonempty(),
    allergies: z.string().default(''),
    address: z
      .object({
        streetAddress: zodRequiredString({
          error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.address`
        }),
        city: zodRequiredString({
          error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.city`
        }),
        postalcode: zodRequiredString({
          error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.country`
        }),
        country: zodRequiredString({
          error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.adress.postal-code`
        })
      })
      .required(),
    freelance: z.boolean(),
    spokenLanguages: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.spoken-languages`
    }),
    medicalAndPhysicalCondition: z.string().nullish(),
    passport: z
      .object({
        number: zodOptionalString(),
        validity: zodOptionalString({ min: 10 })
      })
      .optional()
      .superRefine((data, ctx) => {
        if (data === undefined || (data.number === undefined && data.validity === undefined))
          return; // normal case, optionnal field
        // when data not undefined fields required
        if (data.number === undefined || data.validity === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: ['personalInformationPassport'],
            message: `${RouteTypes.Form}.${Forms.Journalist}.validations.personal-information.passport`
          });
        }
      }),
    emergencyContacts: z
      .array(
        z.object({
          name: zodRequiredString({
            error: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.name`
          }),
          phoneNumber: zodRequiredString({
            error: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.phone-number`
          })
        })
      )
      .min(1, {
        error: `${RouteTypes.Form}.${Forms.Journalist}.validations.emergency-contacts.minimum`
      })
      .default([
        {
          name: '',
          phoneNumber: ''
        }
      ])
  })
  .required();

export const schemaStep1 = z
  .object({
    mediaName: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-name`
    }),
    thematic: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.thematic`
    }),
    audienceProfile: zodRequiredString({
      error: `${RouteTypes.Form}.${Forms.Journalist}.validations.audience-profile`
    }),
    mediaTypes: mediaTypes,
    printMediaStatistics: printMediaStatistics,
    radioAndTVMediaStatistics: radioAndTVMediaStatistics,
    onlineMediaStatistics: onlineMediaStatistics,
    objectRequest: zodRequiredString()
  })
  .required()
  .superRefine((data, ctx) => {
    if (data.mediaTypes.includes(MediaTypes.Print) && !data.printMediaStatistics) {
      ctx.addIssue({
        code: 'custom',
        path: ['printMediaStatistics'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }

    if (
      [MediaTypes.Radio, MediaTypes.Tv].some((requiredType) =>
        data.mediaTypes.includes(requiredType)
      ) &&
      !data.radioAndTVMediaStatistics
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['radioAndTVMediaStatistics'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }

    if (data.mediaTypes.includes(MediaTypes.Online) && !data.onlineMediaStatistics) {
      ctx.addIssue({
        code: 'custom',
        path: ['onlineMediaStatistics'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }
  });

export const schemaStep2 = schemaStep1
  .safeExtend({
    mediaCoveragePrint: mediaCoveragePrint,
    mediaCoverageOnline: mediaCoverageOnline,
    mediaCoverageTvOrRadio: mediaCoverageTvOrRadio
  })
  .required()
  .superRefine((data, ctx) => {
    if (data.mediaTypes.includes(MediaTypes.Print) && !data.mediaCoveragePrint) {
      ctx.addIssue({
        code: 'custom',
        path: ['mediaCoveragePrint'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }

    if (
      [MediaTypes.Radio, MediaTypes.Tv].some((requiredType) =>
        data.mediaTypes.includes(requiredType)
      ) &&
      !data.mediaCoverageTvOrRadio
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['mediaCoverageTvOrRadio'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }

    if (data.mediaTypes.includes(MediaTypes.Online) && !data.mediaCoverageOnline) {
      ctx.addIssue({
        code: 'custom',
        path: ['mediaCoverageOnline'],
        message: `${RouteTypes.Form}.${Forms.Journalist}.validations.media-statistics`
      });
    }
  });

export const schemaStep3 = schemaStep2.safeExtend({
  travelInformation: travelInformation
});

export const schemaStep4 = schemaStep3
  .safeExtend({
    personalInformation: personalInformation,
    travelInsuranceCoveringSwitzerland: z.boolean(),
    remarks: z.string().nullish(),
    readTermsOfAcceptance: z.boolean({
      error: `${RouteTypes.Form}.validations.read-terms-of-acceptance`
    }),
    newsletter: z.boolean().default(true)
  })
  .superRefine((data, ctx) => {
    if (!data.readTermsOfAcceptance) {
      ctx.addIssue({
        code: 'custom',
        path: ['readTermsOfAcceptance'],
        message: `${RouteTypes.Form}.validations.terms-of-acceptance`
      });
    }
  });

export type Schema = z.infer<typeof schemaStep4>;
