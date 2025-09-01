import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const load = async ({ url, params, parent }) => {
    const { i18n, translations } = await parent();
    const lang = params.locale as Locale;

    await Promise.all([
        loadTranslations(lang, '/'),
        loadTranslations(lang, `/${lang}`),
    ]);

    const seo: SeoHeader = {
        canonical: `${PUBLIC_BASE_URL}${url.pathname}`,
        title: translations[lang][`page.title`],
        description: translations[lang][`page.meta-description`],
        image: `${PUBLIC_BASE_URL}/seo/poster-home.png`,
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