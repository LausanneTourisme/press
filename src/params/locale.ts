import { isLocale, type Locale } from '$lib/translations';

export const match = (param: string): param is Locale => {
  return isLocale(param.toLowerCase());
};
