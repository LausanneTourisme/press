import { RouteTypes } from '#lib/enums';
import { edgeCache } from '#lib/helpers/cache.server.js';
import { supportedLocales, translations } from '#lib/translations';
import type { EntryGenerator } from './$types';

export const load = ({ setHeaders }) => {
  setHeaders(edgeCache(28800));
};

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap((locale) => {
    const type = t[locale][`route.${RouteTypes.Highlights}.slug`];
    return {
      locale,
      type
    };
  });
};
