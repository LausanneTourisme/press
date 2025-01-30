import {error, redirect, type Handle, type ResolveOptions} from '@sveltejs/kit';
import {sequence} from "@sveltejs/kit/hooks";
import {get} from "svelte/store";
import { defaultLocale, isValidLocale, setLocale, setRoute, type Locale } from '$lib/translations';
import type { HandleServerError, RequestEvent } from '@sveltejs/kit';

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

const resolveLanguage: Handle = async ({event, resolve, ...rest}) => {
    if (event.url.pathname === '/') {
        redirect(302, `/${getNavLocale(event.request)}`)
    }

    if(!isValidLocale(event.params.locale ?? '')){
        await setLocale(defaultLocale);
        await setRoute('error');
        return await resolve(event, {
            transformPageChunk: ({html}) => html.replace('%lang%', defaultLocale)
        });
    }

    const locale = event.params.locale as Locale|undefined  ?? defaultLocale;
    await setLocale(locale);
    await setRoute(event.url.pathname);
    
    return await resolve(event, {
        transformPageChunk: ({html}) => html.replace('%lang%', locale)
    });
}

export const handle: Handle = sequence(resolveLanguage)



export const handleError: HandleServerError = async ({ event }) => {
    const { locals } = event;
    const { lang } = locals;
  
    await setLocale(lang ?? defaultLocale);
    await setRoute('error');
  
    return locals ?? defaultLocale;
  };