import { RouteTypes, type RouteType } from '$enums';
import { defaultLocale, loadTranslations, locale, supportedLocales, translations as libTranslations, type Locale } from '$lib/translations';
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

    const type = translations[lang][`route.type.${RouteTypes.Presskit}.slug`] === params.type ? RouteTypes.Presskit : RouteTypes.Pressrelease
    console.log(`/${lang}/${params.type}`)
    await loadTranslations(params.locale ?? defaultLocale, `/${lang}/${params.type}`)
    
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
        translations: libTranslations.get(),
        seo,
        locale: lang,
        type,
    };
};