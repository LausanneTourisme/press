import { dev } from "$app/environment";
import i18n, { type Config, type Parser } from 'sveltekit-i18n';
import langDe from './de/lang.json';
import routeTypeDe from './de/route.json';
import langEn from './en/lang.json';
import routeTypeEn from './en/route.json';
import langFr from './fr/lang.json';
import routeTypeFr from './fr/route.json';

export type Locale = 'fr' | 'en' | 'de';
export const defaultLocale: Locale = dev ? 'fr' : 'en'; // devs working with french content ❤️
export const supportedLocales: Locale[] = ['fr', 'en', 'de'];

export const config: Config = {
  fallbackLocale: defaultLocale,
  cache: dev ? 0 : undefined, //no cache in dev
  log: {
    level: dev ? 'warn' : 'error',
  },
  translations: {
    fr: {
      lang: langFr,
      route: routeTypeFr
    },
    en: {
      lang: langEn,
      route: routeTypeEn
    },
    de: {
      lang: langDe,
      route: routeTypeDe
    },
  },
  loaders: [
    // ALL because old system was ""perfect""
    // ...[{
    //   locale: 'fr',
    //   key: '',
    //   loader: async () => (await import('./fr/all.json')).default,
    // },
    // {
    //   locale: 'en',
    //   key: '',
    //   loader: async () => (await import('./en/all.json')).default,
    // },
    // {
    //   locale: 'de',
    //   key: '',
    //   loader: async () => (await import('./de/all.json')).default,
    // },],

    // Route
    ...supportedLocales.map(locale => ({
      locale,
      key: 'route',
      routes: undefined,
      loader: async () => (await import(`./${locale}/route.json`)).default,
    })),
  ],
}

export const {
  t,
  locale,
  locales,
  loading,
  addTranslations,
  loadTranslations,
  translations,
  setRoute,
  setLocale,
} = new i18n(config);

export const isValidLocale = (locale: Locale | string): boolean => {
  // Get defined locales
  const supportedLocales = locales.get();

  // Use default locale if current locale is not supported
  return supportedLocales.includes(locale.toLowerCase())
}