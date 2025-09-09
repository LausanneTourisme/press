import { z } from 'zod';

export const emptyStringToUndefined = (s: unknown) =>
    typeof s === 'string' && s.trim() === '' ? undefined : s;

export const zodRequiredString = (args?: {message?: string, min?: number}) => z.preprocess(emptyStringToUndefined, z.string().min(args?.min ?? 2).nonempty(), { message: args?.message });
export const zodOptionalString = (args?: {message?: string, min?: number}) => z.preprocess(emptyStringToUndefined, z.string().min(args?.min ?? 0).nullish(), { message: args?.message });