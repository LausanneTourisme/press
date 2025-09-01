import { RouteTypes } from '$enums';
import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const load = async ({ url, params, parent }) => {
    const { i18n, translations } = await parent();

    const lang = params.locale as Locale;
    await loadTranslations(lang, url.pathname)

    const seo: SeoHeader = {
        canonical: `${PUBLIC_BASE_URL}${url.pathname}`,
        title: translations[lang][`${RouteTypes.Coverage}.title`],
        description: translations[lang][`${RouteTypes.Coverage}.meta-description`],
        image: `${PUBLIC_BASE_URL}/seo/poster-home.png`,
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Coverage}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        type: RouteTypes.Coverage,
    };
};