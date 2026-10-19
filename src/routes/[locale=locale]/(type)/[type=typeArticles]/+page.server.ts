import { RouteTypes } from '#lib/enums';
import { supportedLocales, translations } from '#lib/translations';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';
import { edgeCache } from '#lib/helpers/cache.server.js';

export const load = ({ setHeaders }) => {
  setHeaders(edgeCache(31536000));
  throw error(404);
};

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap((locale) => {
    const type = t[locale][`route.${RouteTypes.Articles}.slug`];
    return {
      locale,
      type
    };
  });
};
