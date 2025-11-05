import { Forms, getValues, RouteTypes, SocialNetworks, Titles, TravelReductions } from '$enums';
import { zodRequiredString } from '$lib/helpers/zod';
import { z } from 'zod/v4';

const socialNetworkEnum = z.enum(getValues(SocialNetworks));
const socialNetworkTypes = z
  .array(socialNetworkEnum)
  .min(1, `${RouteTypes.Forms}.validations.non-empty-array`);
const travelReductionsEnum = z.enum(getValues(TravelReductions));
const allowedMimeTypes = [
  // Image types
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];
const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, `${RouteTypes.Forms}.validations.file-size`)
  .refine((file) => file.size <= 10 * 1024 * 1024, `${RouteTypes.Forms}.validations.file-size`)
  .refine(
    (file) => allowedMimeTypes.includes(file.type),
    `${RouteTypes.Forms}.validations.file-invalid-type`
  );

export const schemaStep1 = z
  .object({
    contentPositioning: zodRequiredString(),
    targetAudience: zodRequiredString(),
    onlinePresence: socialNetworkTypes.default([]),
    objectRequest: zodRequiredString(),

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
    blogMonthlyUniqueVisitors: z.number().positive().nullish(),
    blogMonthlyPageViews: z.number().positive().nullish()
  })
  .refine(
    (data) => {
      if (data.onlinePresence.includes('instagram')) {
        return !!data.instagramAccountsScreenshots && data.instagramAccountsScreenshots?.length > 0;
      }
      return true;
    },
    {
      path: ['instagramAccountsScreenshots']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('instagram')) {
        return !!data.instagramProfileURL;
      }
      return true;
    },
    {
      path: ['instagramProfileURL']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('instagram')) {
        return (
          !!data.instagramSubscriberScreenshots && data.instagramSubscriberScreenshots?.length > 0
        );
      }
      return true;
    },
    {
      path: ['instagramSubscriberScreenshots']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('tiktok')) {
        return !!data.tiktokProfileURL;
      }
      return true;
    },
    {
      path: ['tiktokProfileURL']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('tiktok')) {
        return !!data.tiktokSubscriberScreenshots && data.tiktokSubscriberScreenshots?.length > 0;
      }
      return true;
    },
    {
      path: ['tiktokSubscriberScreenshots']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('youtube')) {
        return !!data.youtubeProfileURL;
      }
      return true;
    },
    {
      path: ['youtubeProfileURL']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('youtube')) {
        return !!data.youtubeSubscriberScreenshots && data.youtubeSubscriberScreenshots?.length > 0;
      }
      return true;
    },
    {
      path: ['youtubeSubscriberScreenshots']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('blog')) {
        return !!data.blogAudienceProfile;
      }
      return true;
    },
    {
      path: ['blogAudienceProfile']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('blog')) {
        return !!data.blogMonthlyPageViews;
      }
      return true;
    },
    {
      path: ['blogMonthlyPageViews']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('blog')) {
        return !!data.blogMonthlyUniqueVisitors;
      }
      return true;
    },
    {
      path: ['blogMonthlyUniqueVisitors']
    }
  )
  .refine(
    (data) => {
      if (data.onlinePresence.includes('blog')) {
        return !!data.blogURL;
      }
      return true;
    },
    {
      path: ['blogURL']
    }
  );

export const schemaStep2 = schemaStep1.safeExtend({
  coveragePublicationAngle: zodRequiredString(),
  coverageSubjectsOfInterest: zodRequiredString(),
  coveragePublicationChannels: socialNetworkTypes.min(1).default([]),
  coverageProposedMediaCoverage: zodRequiredString(),
  coverageTimingAndPublicationDates: zodRequiredString()
});

export const schemaStep3 = schemaStep2
  .safeExtend({
    travelDepartureCity: zodRequiredString(),
    travelDepartureCountry: zodRequiredString(),
    travelOutwardJourney: z.string().max(300).optional().nullable().nullish(),
    travelReturnJourney: z.string().nullish().optional(),
    travelReductions: z.array(travelReductionsEnum).default([]).optional(),
    travelLastVisit: z.string().nullish()
  })
  .required();

export const schemaStep4 = schemaStep3
  .safeExtend({
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

    emergencyContactNames: z.array(zodRequiredString()).min(1, {
      error: `${RouteTypes.Forms}.${Forms.ContentCreator}.validations.emergency-contacts.name`
    }),
    emergencyContactPhones: z.array(zodRequiredString()).min(1, {
      error: `${RouteTypes.Forms}.${Forms.ContentCreator}.validations.emergency-contacts.phone-number`
    }),

    travelInsuranceCoveringSwitzerland: z.boolean(),
    remarks: z.string().nullish(),
    readTermsOfAcceptance: z.boolean({
      error: `${RouteTypes.Forms}.validations.read-terms-of-acceptance`
    }),
    newsletter: z.boolean().default(true)
  })
  .required()
  .superRefine((data, ctx) => {
    // Either both passport fields or neither
    const hasNumber = Number(data.passportNumber?.length) > 2;
    const hasValidity = Number(data.passportValidity?.length) > 2;

    if (
      hasNumber !== hasValidity ||
      (data.passportNumber && (data.passportNumber.trim() === '' || !hasNumber)) ||
      (data.passportValidity && (data.passportValidity.trim() === '' || !hasValidity))
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['personalInformationPassport'],
        message: `${RouteTypes.Forms}.${Forms.ContentCreator}.validations.personal-information.passport`
      });
    }

    // The two fields go hand in hand!
    if (data.emergencyContactNames.length !== data.emergencyContactPhones.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['emergencyContacts']
      });
    }

    // emergency name or phone can't be empty
    data.emergencyContactNames.forEach((_, index) => {
      if (
        data.emergencyContactNames[index] === '' ||
        data.emergencyContactNames[index] === undefined
      ) {
        ctx.addIssue({
          code: 'custom',
          path: [`emergencyContactNames_${index}`]
        });
      }
      if (
        data.emergencyContactPhones[index] === '' ||
        data.emergencyContactPhones[index] === undefined
      ) {
        ctx.addIssue({
          code: 'custom',
          path: [`emergencyContactPhones_${index}`]
        });
      }
    });

    // user should read terms !
    if (!data.readTermsOfAcceptance) {
      ctx.addIssue({
        code: 'custom',
        path: ['readTermsOfAcceptance'],
        message: `${RouteTypes.Forms}.validations.terms-of-acceptance`
      });
    }
  });

export type Schema = z.infer<typeof schemaStep4>;
