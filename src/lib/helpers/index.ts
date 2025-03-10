import type { RouteType } from "$enums";
import { defaultLocale, locale, t, type Locale } from "$lib/translations";

/**
 * simple wrapper for scan.js to pick it up
 */
export const _ = (text: string): string => text;
export const blankable = (href: string | undefined): string | undefined => href && href.includes('http') ? '_blank' : undefined;

/**
 * get filename from a path
 */
export const filename = (path: string, withExtension: boolean = true): string => {
  let filename: string;

  if (path.startsWith('/')) {
    filename = path.substring(1)
  }

  filename = <string>path.split('/').pop();

  if (withExtension) {
    return filename;
  }

  return <string>filename.split('.').shift();
}

export const getMediaLibraryRegisterLink = (locale: Locale): string => {
  let lang = 'lang=';

  switch (locale) {
    case 'fr':
      lang += 'fr_FR';
      break;
    case 'de':
      lang += 'de_DE';
      break;
    default:
      lang += 'en_US';
      break;
  }

  return `https://medialibrary.lausanne-tourisme.ch?registration&${lang}`;
}

export const route = (type: RouteType, forceLocale: Locale | undefined = undefined): string => {
  const lang = forceLocale ?? locale.get() as Locale ?? defaultLocale;
  const slug: string | undefined = t.get(`route.${type}.slug`);

  if (!slug) return `/${lang}`;
  return `/${lang}/${slug}`;
}

export const getKeyByValue = (object: Record<string, unknown>, value: unknown): unknown => {
  return Object.keys(object).find((key: string) => object[key] === value);
}

export const randomString = (length: number = 6): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  let counter = 0;

  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }

  return result;
}

export const isDarkMode = (): boolean => {
  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return darkModeQuery.matches;
}