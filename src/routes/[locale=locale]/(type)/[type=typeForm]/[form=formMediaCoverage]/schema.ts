import { getValues, RouteTypes, SocialNetworks } from '$enums';
import { zodOptionalString } from '$lib/helpers/zod';
import { z } from 'zod/v4';

const socialNetworkEnum = z.enum(getValues(SocialNetworks));
const socialNetworkTypes = z
  .array(socialNetworkEnum)
  .min(1, `${RouteTypes.Forms}.validations.non-empty-array`);
const socialNetworksRequirements = getValues(SocialNetworks).filter((x) => x !== 'blog');

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

export const schema = z
  .object({
    socialNetworks: socialNetworkTypes,

    personalEmail: z.email().nonempty().nonoptional(),

    username: zodOptionalString({ min: 2 }),

    blogPostURL: z.url().optional(),
    blogMonthlyUniqueVisitors: z.number().positive().nullish(),
    numberOfPosts: z.number().nonnegative().optional(),
    numberOfClicks: z.number().optional(),
    scopeOfPosts: z.array(fileSchema).max(20).default([]),
    interactionWithPosts: z.array(fileSchema).max(20).default([]),

    numberOfStories: z.number().nonnegative().optional(),
    averageStoryReach: z.array(fileSchema).max(20).default([]),
    interactionWithStories: z.array(fileSchema).max(20).default([]),

    remarks: zodOptionalString({ min: 2 })
  })
  .refine(
    (data) => {
      if (data.socialNetworks.some((x) => (socialNetworksRequirements as string[]).includes(x))) {
        return !!data.username;
      }
      return true;
    },
    {
      path: ['username']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.some((x) => (socialNetworksRequirements as string[]).includes(x))) {
        return !!data.numberOfPosts;
      }
      return true;
    },
    {
      path: ['numberOfPosts']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.some((x) => (socialNetworksRequirements as string[]).includes(x))) {
        return data.scopeOfPosts.length > 0;
      }
      return true;
    },
    {
      path: ['scopeOfPosts']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.some((x) => (socialNetworksRequirements as string[]).includes(x))) {
        return data.interactionWithPosts.length > 0;
      }
      return true;
    },
    {
      path: ['interactionWithPosts']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.includes('instagram')) {
        return !!data.numberOfStories;
      }
      return true;
    },
    {
      path: ['numberOfStories']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.includes('instagram')) {
        return data.averageStoryReach.length > 0;
      }
      return true;
    },
    {
      path: ['averageStoryReach']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.includes('instagram')) {
        return data.interactionWithStories.length > 0;
      }
      return true;
    },
    {
      path: ['interactionWithStories']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.includes('blog')) {
        return !!data.blogPostURL;
      }
      return true;
    },
    {
      path: ['blogPostURL']
    }
  )
  .refine(
    (data) => {
      if (data.socialNetworks.includes('blog')) {
        return !!data.blogMonthlyUniqueVisitors;
      }
      return true;
    },
    {
      path: ['blogMonthlyUniqueVisitors']
    }
  );

export type Schema = z.infer<typeof schema>;
