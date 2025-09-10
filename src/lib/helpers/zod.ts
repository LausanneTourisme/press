import { z } from 'zod';

export const emptyStringToUndefined = (s: unknown) =>
    typeof s === 'string' && s.trim() === '' ? undefined : s;

export const zodRequiredString = (args?: { error?: string, min?: number }) => z.string().min(args?.min ?? 2, { error: args?.error }).nonempty({ error: args?.error })
export const zodOptionalString = (args?: { error?: string, min?: number }) => z.string().min(args?.min ?? 0, {error: args?.error}).optional()