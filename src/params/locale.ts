import { isLocale } from '$lib/translations';
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param: string) => {
    return isLocale(param.toLowerCase());
};