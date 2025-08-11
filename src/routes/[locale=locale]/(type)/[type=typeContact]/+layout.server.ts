import { RouteTypes } from '$enums';
import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

export const load = async ({ url, params, parent }) => {
    const { i18n, translations } = await parent();

    const lang = params.locale as Locale;
    await loadTranslations(lang, url.pathname)

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`${RouteTypes.Contact}.title`],
        description: translations[lang][`${RouteTypes.Contact}.meta-description`],
        image: `${url.origin}/seo/poster-home.png`,
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Contact}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        type: RouteTypes.Contact,
    };
};