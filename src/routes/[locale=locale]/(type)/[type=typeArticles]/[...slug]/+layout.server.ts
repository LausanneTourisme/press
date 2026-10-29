import { dev } from '$app/env';
import { RouteTypes } from '#lib/enums';
import { isOfflineMode } from '#lib/helpers';
import { generateCloudinaryUrl } from '#lib/helpers/image.js';
import { getPost } from '#lib/services/requests.server.js';
import { loadTranslations, supportedLocales, type Locale } from '#lib/translations';
import type { SeoHeader } from '#lib/types';
import { error } from '@sveltejs/kit';
import { edgeCache } from '#lib/helpers/cache.server.js';

export const load = async ({ params, parent, url, fetch, setHeaders }) => {
  if (dev && isOfflineMode) {
    const { startServer } = await import('#lib/mocks/handler.js');
    startServer();
  }

  const [{ i18n, translations, locale, type }, articleRes] = await Promise.all([
    parent(),
    getPost(params.slug ?? '', fetch)
  ]);

  const article = articleRes.data?.item;
  if (!article || !article.languages?.includes(locale)) throw error(404);

  setHeaders(edgeCache(28800));

  await loadTranslations(locale, url.pathname);

  const seo: SeoHeader = {
    canonical: `https://www.lausanne-tourisme.ch/${locale}/the-lausanner/articles/${article.seo?.slug?.[locale]}`,
    title: article.name?.[locale as Locale] ?? translations[locale][`${RouteTypes.Articles}.title`],
    description:
      article.lead?.[locale as Locale] ??
      translations[locale][`${RouteTypes.Articles}.meta-description`],
    image: generateCloudinaryUrl({
      src: article.medias?.at(0)?.cloudinary_id ?? 'default',
      usePreset: false,
      transform: { h: 720, w: 1280 }
    }),
    articleAlternate: supportedLocales
      .filter((l) => article.languages?.includes(l))
      .map((locale) => ({
        hreflang: locale,
        href: `/${locale}/${translations[locale][`route.${RouteTypes.Articles}.slug`]}/${article.seo?.slug?.[locale]}`
      }))
  };

  return { i18n, translations, seo, locale, type, article };
};
