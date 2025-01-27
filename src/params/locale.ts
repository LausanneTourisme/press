import { supportedLocales, type Locale } from "$lib/translations";

export const match = (param: string): boolean => {
    return /^[a-z]{2}$/.test(param) && supportedLocales.includes(param as Locale);
}