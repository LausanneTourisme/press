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
    const { i18n, translations }: Parent = await parent() as Parent;
    const { locale, type }: Partial<Params> = params as Partial<Params>;

    return {
        i18n,
        translations,
        locale,
        type,
    };
};