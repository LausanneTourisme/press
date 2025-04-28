import { defaultLocale, isValidLocale, locale, setLocale, supportedLocales, type Locale } from "$lib/translations";
import type { MaybePromise } from "$types";
import type { RequestEvent, ResolveOptions } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const resolveLanguage = async ({ event, resolve }: {
    event: RequestEvent,
    resolve: (event: RequestEvent, opts?: ResolveOptions) => MaybePromise<Response>,
}) => {
    const lang = event.request.headers.get('accept-language')?.split(',')[0];

    if (lang && isValidLocale(lang)) {
        await setLocale(lang);
    } else {
        await setLocale(defaultLocale);
    }

    return await resolve(event, {
        transformPageChunk: ({ html }) => {
            // Replace %lang% with the current locale
            const currentLocale = locale.get();  // Get the current locale from the store
            return html.replace('%lang%', currentLocale);
        }
    });
};
export const handle = sequence(resolveLanguage);