import { dev } from '$app/env';
import { RouteTypes } from '#lib/enums';
import { isOfflineMode } from '#lib/helpers';
import { sortByYears } from '#lib/helpers/date.js';
import { getPosts } from '#lib/services/requests.server.js';
import { supportedLocales, translations } from '#lib/translations';
import type { Release } from '#lib/types';
import type { EntryGenerator } from './$types';
import { edgeCache } from '#lib/helpers/cache.server.js';

export const prerender = false;

export const load = async ({ parent, fetch, setHeaders }) => {
  setHeaders(edgeCache(28800));
  if (dev && isOfflineMode) {
    const { startServer } = await import('#lib/mocks/handler.js');
    startServer();
  }

  const { locale } = await parent();

  const releasesRes = await getPosts<Release<string>>({
    type: 'press_release',
    locale,
    fetchFn: fetch
  });

  const releases = releasesRes.data?.items?.data ?? [];

  return {
    payload: {
      releasesByDates: new Map([...sortByYears(releases)].reverse())
    }
  };
};

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap((locale) => {
    const type = t[locale][`route.${RouteTypes.PressreleasesAndPresskits}.slug`];
    return {
      locale,
      type
    };
  });
};
