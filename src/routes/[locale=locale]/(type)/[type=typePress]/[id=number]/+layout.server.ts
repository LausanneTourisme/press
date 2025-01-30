import { RouteTypes, type RouteType } from '$enums';
import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, translations, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { error, redirect, type ServerLoad } from '@sveltejs/kit';

interface Parent {
    i18n: {
        locale: Locale,
        route: string
    },
    translations: {
        [key in Locale]: Record<string, string>
    },
    locale: Locale,
    type: RouteType,
    seo: SeoHeader,
};

export const load: ServerLoad = async ({ params, parent, url, ...rest }) => {
    const { i18n, translations, locale, type, seo }: Parent = await parent() as Parent;
    
    return {
        i18n,
        translations,
        locale,
        type,
        id: params.id,
    };
};