import i18n, { type Config, type Parser } from 'sveltekit-i18n';
import { dev } from "$app/environment";
import langFr from './fr/lang.json';
import langDe from './de/lang.json';
import langEn from './en/lang.json';

export type Locale = 'fr' | 'en' | 'de';
export const defaultLocale: Locale = dev ? 'fr' : 'en'; // devs working with french content ❤️
export const supportedLocales: Array<Locale> = ['fr', 'en', 'de'];

export const config: Config = {
  fallbackLocale: defaultLocale,
  cache: dev ? 0 : undefined, //no cache in dev
  log: {
    level: dev ? 'warn' : 'error',
  },
  translations: {
    fr: { langFr },
    en: { langEn },
    de: { langDe },
  },
  loaders: [
    {
      locale: 'fr',
      key: '',
      loader: async () => (await import('./en/all.json')).default,
    },
    {
      locale: 'en',
      key: '',
      loader: async () => (await import('./en/all.json')).default,
    },
    {
      locale: 'de',
      key: '',
      loader: async () => (await import('./en/all.json')).default,
    },
  ]
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
} = new i18n<Parser.Params<{ count?: number } | Record<string, unknown>>>(config);
