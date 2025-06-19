import { defaultLocale, isValidLocale, loadTranslations, setLocale, supportedLocales, translations, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

const getUrlLocale = (pathname: string): undefined | Locale => {
    let match = pathname.match(/^\/[a-z]{2}/i);
    if (!match) return undefined;

    return isValidLocale(match[0].replace('/', '')) ? match[0].replace('/', '') as Locale : undefined;
}

export const load = async ({ url, cookies, request, locals }) => {
    const lang = getUrlLocale(url.pathname) ?? defaultLocale;

    // undefined case covered by src/params/locale.ts
    await Promise.all([
        setLocale(lang),
        loadTranslations(lang),
        loadTranslations(lang, url.pathname),
    ])

    // FIXME
    // TODO create common translations and insert 404
    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: "Page not found",
        description: "Page informing user that page cannot be found",
        image: '',
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/404`
        })),
    }

    return {
        i18n: { locale: lang, route: url.pathname },
        translations: translations.get(), // `translations` on server contain all translations loaded by different clients
        seo,
    };
};
