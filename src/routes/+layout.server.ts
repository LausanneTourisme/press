import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, supportedLocales, translations, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { error, redirect, type ServerLoad } from '@sveltejs/kit';

const getNavLocale = (request: Request): Locale => {
    // If no cookie is set, try to determine the locale from the 'Accept-Language' header
    const acceptLanguageHeader = request.headers.get('accept-language') || '';
    // Attempt to match the language code with optional region code
    let match = acceptLanguageHeader.match(/^[a-z]+(?=[-_])/i);

    // If no match is found, try to match just the language code
    if (!match) {
        match = acceptLanguageHeader.match(/^[a-z]+/i);
    }

    if (match && isValidLocale(match[0])) return match[0].toLowerCase() as Locale;

    // If a match is found, use it as the locale, otherwise fall back to the default locale
    return defaultLocale;
}

const getUrlLocale = (pathname: string): undefined | Locale => {
    let match = pathname.match(/^\/[a-z]{2}/i);
    if (!match) return undefined;

    return isValidLocale(match[0].replace('/', '')) ? match[0].replace('/', '') as Locale : undefined;
}



export const load: ServerLoad = async ({ url, cookies, request, locals }) => {
    if (url.pathname === '/') {
        redirect(302, `/${getNavLocale(request)}`)
    }

    const lang: undefined | Locale = getUrlLocale(url.pathname);

    // undefined cased covered by src/params/locale.ts
    await setLocale(lang ?? defaultLocale);
    await loadTranslations(lang ?? defaultLocale);
    await loadTranslations(lang ?? defaultLocale, url.pathname);
    
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