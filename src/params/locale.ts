import { isLocale, type Locale } from '$lib/translations';
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param: string): param is Locale => {
  return isLocale(param.toLowerCase());
}) satisfies ParamMatcher;
