import { dev } from '$app/environment';
import { RouteTypes, Themes, type Theme } from '$enums';
import { isOfflineMode } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/services/requests.server';
import { supportedLocales, translations } from '$lib/translations';
import type { Post } from '$types';
import type { EntryGenerator } from './$types';

export const load = async ({ params, parent, fetch, setHeaders }) => {
  if (dev && isOfflineMode) {
    const { server } = await import('$lib/mocks/handler');
    server.listen();
  }

  const { locale, translations } = await parent();
  const theme: Theme = Object.values(Themes).find(
      (theme) => translations[locale][`route.${RouteTypes.Themes}.${theme}.slug`] === params.theme
    )!;

  const tag = getTag(theme);
  const [postsRes, favoritesRes] = await Promise.all([
    getPosts<Post<string>>({ type: 'post', locale, tags: tag, fetchFn: fetch }),
    getFavorites<string>({ locale, theme, fetchFn: fetch })
  ]);

  const allArticles = postsRes.data?.items?.data ?? [];
  const favorites = favoritesRes.data?.items?.data ?? [];

  return {
    payload: {
      articles: allArticles.filter((a) => !a.highlight),
      highlightedArticle: allArticles.find((a) => a.highlight) as Post<string> | undefined,
      favorites
    }
  };
};

export const entries: EntryGenerator = () => {
  const t = translations.get();
  const themes = Object.values(Themes);

  return supportedLocales.flatMap((locale) => {
    const type = t[locale][`route.${RouteTypes.Themes}.slug`];
    return themes.map((theme) => {
      return {
        locale,
        type,
        theme: t[locale][`route.${RouteTypes.Themes}.${theme}.slug`]
      };
    });
  });
};
