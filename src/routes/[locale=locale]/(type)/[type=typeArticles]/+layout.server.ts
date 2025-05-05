import { RouteTypes } from '$enums';
import { supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { type ServerLoad } from '@sveltejs/kit';

interface Parent {
    i18n: {
        locale: Locale,
        route: string
    },
    translations: {
        [key in Locale]: Record<string, string>
    }
};

export const load: ServerLoad = async ({ url, params, parent }) => {
    const { i18n, translations }: Parent = await parent() as Parent;

    const lang = params.locale as Locale;

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`page.title`],
        description: translations[lang][`page.description`],
        image: '', //TODO add picture please
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Articles}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        type: RouteTypes.Articles,
    };
};