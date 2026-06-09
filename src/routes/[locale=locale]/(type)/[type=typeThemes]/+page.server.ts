import { RouteTypes } from '$enums';
import { supportedLocales, translations } from '$lib/translations';
import type { EntryGenerator } from './$types';

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, max-age=31536000, immutable' });
};

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap((locale) => {
    const type = t[locale][`route.${RouteTypes.Themes}.slug`];
    return {
      locale,
      type
    };
  });
};
