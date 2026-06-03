import { RouteTypes } from '$enums';
import { supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';

export const load = async ({ url, params, parent }) => {
  const { i18n, translations } = await parent();

  const lang = params.locale as Locale;

  const seo: SeoHeader = {
    canonical: `${url.origin}${url.pathname}`,
    title: translations[lang][`${RouteTypes.Forms}.title`],
    description: translations[lang][`${RouteTypes.Forms}.description`],
    image: `${url.origin}/seo/poster-home.png`,
    alternate: supportedLocales.map((locale) => ({
      hreflang: locale,
      href: `/${locale}/${translations[locale][`route.${RouteTypes.Forms}.slug`]}`
    }))
  };

  return {
    i18n,
    translations,
    seo,
    locale: lang,
    type: RouteTypes.Forms
  };
};
