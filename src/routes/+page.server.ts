
import { dev } from '$app/environment';
import { defaultLocale, isValidLocale, type Locale } from '$lib/translations';
import { redirect } from '@sveltejs/kit';

const getNavLocale = (request: Request) => {
    if (dev) return defaultLocale;

    const acceptLanguageHeader = request.headers.get('accept-language') || '';
    // Attempt to match the language code with optional region code
    let match = acceptLanguageHeader.match(/^[a-z]{2}/i);
    // If no match is found, try to match just the language code
    if (!match) {
        match = acceptLanguageHeader.match(/^[a-z]+/i);
    }

    if (match && isValidLocale(match[0])) return match[0].toLowerCase() as Locale;

    // If a match is found, use it as the locale, otherwise fall back to the default locale
    return defaultLocale;
};

export const load = async ({ url, request }) => {
    const locale = getNavLocale(request);
    throw redirect(302, `/${locale}`);
};
