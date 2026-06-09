import { supportedLocales } from '$lib/translations';
import type { EntryGenerator } from './$types';

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=28800, stale-while-revalidate=3600' });
};

export const entries: EntryGenerator = () => {
  return supportedLocales.map((locale) => ({ locale }));
};
