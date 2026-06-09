import { Forms, RouteTypes } from '$enums';
import { supportedLocales, translations } from '$lib/translations';
import type { EntryGenerator } from '../$types';

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=3600' });
};

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap((locale) => {
    return {
      locale,
      type: t[locale][`route.${RouteTypes.Forms}.slug`],
      form: t[locale][`route.${RouteTypes.Forms}.${Forms.Thanks}.slug`]
    };
  });
};
