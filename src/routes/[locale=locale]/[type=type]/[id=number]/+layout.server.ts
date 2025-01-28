import { RouteTypes, type RouteType } from '$enums';
import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, translations, type Locale } from '$lib/translations';
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
    id: number
};

export const load: ServerLoad = async ({ params, parent, url, ...rest }) => {
    const { i18n, translations, locale, type, id }: Parent = await parent() as Parent;
    const pathName = url.pathname;

    const validTypes = [
        translations[locale][`route.type.${RouteTypes.Presskit}.slug`],
        translations[locale][`route.type.${RouteTypes.Pressrelease}.slug`]
    ];

    if(!validTypes.includes(type)) throw error(404)

    return {
        locale,
        type,
        id,
    };
};