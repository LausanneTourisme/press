import { dev } from '$app/environment';
import { RouteTypes } from '$enums';
import { redirect } from '@sveltejs/kit';
import { supportedLocales, translations } from "$lib/translations";
import type { EntryGenerator } from "./$types";


// we don't need any JS on this page, though we'll load
// it in dev so that we get hot module replacement
export const csr = dev;

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

export const load = async ({ parent }) => {
    const { locale, translations } = await parent();
    throw redirect(302, `/${locale}/${translations[locale][`route.${RouteTypes.PressreleasesAndPresskits}.slug`]}`);
};


export const entries: EntryGenerator = () => {
    const t = translations.get();

    return [
        ...supportedLocales.flatMap(locale => {
            const type = t[locale][`route.${RouteTypes.Presskit}.slug`];
            return {
                locale,
                type,
            };
        }),
        ...supportedLocales.flatMap(locale => {
            const type = t[locale][`route.${RouteTypes.Pressrelease}.slug`];
            return {
                locale,
                type,
            };
        }),
    ]
};