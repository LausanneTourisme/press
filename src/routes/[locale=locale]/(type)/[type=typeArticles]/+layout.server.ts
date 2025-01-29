import type { RouteType } from '$enums';
import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, translations, type Locale } from '$lib/translations';
import { error, redirect, type ServerLoad } from '@sveltejs/kit';

interface Parent {
    i18n: {
        locale: Locale,
        route: string
    },
    translations: {
        [key in Locale]: Record<string, string>
    }
};

interface Params {
    locale: Locale,
    type: RouteType,
}

export const load: ServerLoad = async ({ params, parent }) => {
    // console.log({from:'/src/routes/[locale=locale]/[type=type]/+layout.server.ts', parent: await parent(), params})
    const { i18n, translations }: Parent = await parent() as Parent;

    return {
        i18n,
        translations,
        locale: params.locale,
    };
};