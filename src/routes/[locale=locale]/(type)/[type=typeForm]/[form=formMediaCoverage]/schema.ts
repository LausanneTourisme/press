import { getValues, RouteTypes, SocialNetworks } from "$enums";
import { zodOptionalString } from "$lib/helpers/zod";
import { z } from 'zod/v4';

const socialNetworkEnum = z.enum(getValues(SocialNetworks));
const socialNetworkTypes = z.array(socialNetworkEnum).min(1, `${RouteTypes.Form}.validations.non-empty-array`);

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

export const schema = z.object({
    socialNetworks: socialNetworkTypes,

    username: zodOptionalString({ min: 2 }),

    blogPostURL: z.url().optional(),
    numberOfPosts: z.number().nonnegative().optional(),
    numberOfClicks: z.number().optional(),
    scopeOfPosts: z.array(fileSchema).max(20).default([]),
    interactionWithPosts: z.array(fileSchema).max(20).default([]),

    numberOfStories: z.number().nonnegative().optional(),
    averageStoryReach: z.array(fileSchema).max(20).default([]),
    interactionWithStories: z.array(fileSchema).max(20).default([]),

    remarks: zodOptionalString({ min: 2 }),
})
    .refine(data => {
        if (data.socialNetworks.includes("instagram") || data.socialNetworks.includes("tiktok") || data.socialNetworks.includes("youtube")) {
            return !!data.username
        }
        return true;
    }, {
        path: ['username']
    })
    .refine(data => {
        if (data.socialNetworks.some(x => getValues(SocialNetworks).includes(x))) {
            return !!data.numberOfPosts
        }
        return true;
    }, {
        path: ['numberOfPosts']
    })
    .refine(data => {
        if (data.socialNetworks.some(x => getValues(SocialNetworks).includes(x))) {
            return data.scopeOfPosts.length > 0
        }
        return true;
    }, {
        path: ['scopeOfPosts']
    })
    .refine(data => {
        if (data.socialNetworks.some(x => getValues(SocialNetworks).includes(x))) {
            return data.interactionWithPosts.length > 0
        }
        return true;
    }, {
        path: ['interactionWithPosts']
    })
    .refine(data => {
        if (data.socialNetworks.includes("instagram")) {
            return !!data.numberOfStories
        }
        return true;
    }, {
        path: ['numberOfStories']
    })
    .refine(data => {
        if (data.socialNetworks.includes("instagram")) {
            return data.averageStoryReach.length > 0
        }
        return true;
    }, {
        path: ['averageStoryReach']
    })
    .refine(data => {
        if (data.socialNetworks.includes("instagram")) {
            return data.interactionWithStories.length > 0
        }
        return true;
    }, {
        path: ['interactionWithStories']
    })
    .refine(data => {
        if (data.socialNetworks.includes("blog")) {
            return !!data.blogPostURL
        }
        return true;
    }, {
        path: ['blogPostURL']
    })

export type Schema = z.infer<typeof schema>;