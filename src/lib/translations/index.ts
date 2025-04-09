import { dev } from "$app/environment";
import { RouteTypes, Themes } from "$enums";
import i18n, { type Config } from 'sveltekit-i18n';
import langDe from './de/lang.json';
import routeTypeDe from './de/route.json';
import langEn from './en/lang.json';
import routeTypeEn from './en/route.json';
import langFr from './fr/lang.json';
import routeTypeFr from './fr/route.json';

export type Locale = 'fr' | 'en' | 'de';
export const defaultLocale: Locale = dev ? 'fr' : 'en'; // devs working with french content ❤️
export const supportedLocales: Locale[] = ['fr', 'en', 'de'];

//helper for dynamic imports
const routeTypes: Record<Locale, Record<string, string>> = {
  de: routeTypeDe,
  en: routeTypeEn,
  fr: routeTypeFr
};

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

    // Menu
    ...supportedLocales.map(locale => ({
      locale,
      key: 'menu',
      routes: undefined,
      loader: async () => (await import(`./${locale}/menu.json`)).default,
    })),

    // Footer
    ...supportedLocales.map(locale => ({
      locale,
      key: 'footer',
      routes: undefined,
      loader: async () => (await import(`./${locale}/footer.json`)).default,
    })),

    // Common
    ...supportedLocales.map(locale => ({
      locale,
      key: 'common',
      routes: undefined,
      loader: async () => (await import(`./${locale}/common.json`)).default,
    })),

    // GDPR
    ...supportedLocales.map(locale => ({
      locale,
      key: 'gdpr',
      routes: undefined,
      loader: async () => (await import(`./${locale}/gdpr.json`)).default,
    })),

    // Home
    ...supportedLocales.map(locale => ({
      locale,
      key: 'page',
      routes: ['/', `/${locale}`, `/${locale}/`],
      loader: async () => (await import(`./${locale}/pages/${RouteTypes.Home}.json`)).default,
    })),

    //create all routes except HOME/Presskit/Pressrelease, which is a special case
    ...Object.values(RouteTypes)
      .filter(x => x !== RouteTypes.Home)
      .flatMap(type => supportedLocales.map(locale => {
        const slug = routeTypes[locale][`${type}.slug`];
        return {
          locale,
          key: 'pages',
          routes: [`/${locale}/${slug}`, `/${locale}/${slug}/`],
          loader: async () => (await import(`./${locale}/pages/${type}.json`)).default,
        }
      })),

    // Themes
    ...supportedLocales.map(locale => ({
      locale,
      key: 'themes',
      routes: undefined,
      loader: async () => (await import(`./${locale}/pages/themes.json`)).default,
    })),

      //create all translations for specific theme's view
      ...Object.values(Themes)
      .flatMap(theme => supportedLocales.map(locale => {
        const type = routeTypes[locale][`${RouteTypes.Themes}.slug`]
        const slug = routeTypes[locale][`themes.${theme}.slug`];

        return {
          locale,
          key: `themes.${theme}`,
          routes: undefined,
          loader: async () => (await import(`./${locale}/pages/themes/${theme}.json`)).default,
        }
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
  return (supportedLocales as string[]).includes(locale.toLowerCase())
}

export const isLocale = (param: string): param is Locale => {
  return supportedLocales.includes(param as Locale);
};