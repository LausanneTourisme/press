import { RouteTypes } from '$enums';
import { supportedLocales, translations } from '$lib/translations';
import { error } from '@sveltejs/kit';
import type { EntryGenerator } from './$types';

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, max-age=31536000, immutable' });
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
