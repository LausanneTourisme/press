import { RouteTypes } from '$enums';
import { supportedLocales, translations } from '$lib/translations';
import type { EntryGenerator } from './$types';

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=28800, stale-while-revalidate=3600' });
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
