import type { RouteType } from '$enums';
import { locale, supportedLocales, type Locale } from '$lib/translations';
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
    const type = params.type as RouteType;

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`pages.title`],
        description: translations[lang][`pages.description`],
        image: '', //TODO add picture please
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.type.${type}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        type,
    };
};