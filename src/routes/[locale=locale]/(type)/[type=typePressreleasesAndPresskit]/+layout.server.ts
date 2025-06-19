import { RouteTypes } from '$enums';
import { defaultLocale, translations as libTranslations, loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

export const load = async ({ url, params, parent }) => {
    const [{ i18n, translations }] = await Promise.all([
        parent(),
        loadTranslations(params.locale ?? defaultLocale, `/${params.locale}/${params.type}`),
    ]);

    const lang = params.locale as Locale;

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`page.title`],
        description: translations[lang][`page.meta-description`],
        image: '', //TODO add picture please
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.PressreleasesAndPresskits}.slug`]}`
        })),
    }

    return {
        i18n,
        translations: libTranslations.get(),
        seo,
        locale: lang,
        type: RouteTypes.PressreleasesAndPresskits,
    };
};