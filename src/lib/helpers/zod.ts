import { z } from 'zod';

export const emptyStringToUndefined = (s: unknown) =>
    typeof s === 'string' && s.trim() === '' ? undefined : s;

export const zodRequiredString = (args?: {message?: string}) => z.preprocess(emptyStringToUndefined, z.string().min(2), { message: args?.message });
export const zodOptionalString = (args?: {message?: string}) => z.preprocess(emptyStringToUndefined, z.string().nullish(), { message: args?.message });