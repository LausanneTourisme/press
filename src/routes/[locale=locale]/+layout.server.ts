import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

export const load = async ({ url, params, parent }) => {
    const { i18n, translations } = await parent();
    const lang = params.locale as Locale;

    await loadTranslations(lang);

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`page.title`],
        description: translations[lang][`page.meta-description`],
        image: '/images/seo/poster-home.png',
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: params.locale
    };
};