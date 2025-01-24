import { getLocaleFromNavigator, getLocaleFromPathname, getLocaleFromQueryString, init, register } from 'svelte-i18n';
import type { Locale } from '$types/I18n';

export const defaultLocale: Locale = 'fr';
export const supportedLocales: Array<Locale> = ['fr', 'en', 'de'];

const initialLocale: Locale =
  (getLocaleFromQueryString('lang') ??
    getLocaleFromPathname(/^\/(\w{2})/ig) ??
    getLocaleFromNavigator()?.slice(0, 2) ??
    defaultLocale) as Locale;

supportedLocales.forEach(locale => {
  register(locale, () => import((`$lib/locales/${locale}.json`)));
});

init({
  fallbackLocale: defaultLocale,
  initialLocale: (supportedLocales.includes(initialLocale) && initialLocale) || defaultLocale
});