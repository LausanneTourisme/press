import { PUBLIC_BASE_URL } from '$env/static/public';
import { defaultLocale, isValidLocale, loadTranslations, setLocale, supportedLocales, translations, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

const getUrlLocale = (pathname: string): undefined | Locale => {
    let match = pathname.match(/^\/[a-z]{2}/i);
    if (!match) return undefined;

    return isValidLocale(match[0].replace('/', '')) ? match[0].replace('/', '') as Locale : undefined;
}

export const load = async ({ url, cookies, request, locals, route , ...rest }) => {
    const lang = getUrlLocale(url.pathname) ?? defaultLocale;
    // undefined case covered by src/params/locale.ts
    await Promise.all([
        setLocale(lang),
        loadTranslations(lang),
        loadTranslations(lang, url.pathname),
    ])
    const translationsLoaded = translations.get();

    const seo: SeoHeader = {
        canonical: `${PUBLIC_BASE_URL}${url.pathname}`,
        title: translationsLoaded[lang]['common.error.default.title'],
        description: translationsLoaded[lang]['common.error.default.subtitle'],
        image: `${PUBLIC_BASE_URL}/seo/poster-home.png`,
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}`
        })),
    }

    return {
        i18n: { locale: lang, route: url.pathname },
        translations: translationsLoaded, // `translations` on server contain all translations loaded by different clients
        seo,
    };
};
