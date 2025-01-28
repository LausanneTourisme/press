import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, translations, type Locale } from '$lib/translations';
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
    const { pathname } = url;
    // console.log(locals)
    if (pathname === '/') {
        redirect(302, `/${getNavLocale(request)}`)
    }

    const lang: undefined | Locale = getUrlLocale(pathname);

    // undefined cased covered by src/params/locale.ts
    await setLocale(lang ?? defaultLocale);
    await loadTranslations(lang ?? defaultLocale);
    await loadTranslations(lang ?? defaultLocale, pathname);
    
    return {
        i18n: { locale: lang, route: pathname },
        translations: translations.get(), // `translations` on server contain all translations loaded by different clients
    };
};