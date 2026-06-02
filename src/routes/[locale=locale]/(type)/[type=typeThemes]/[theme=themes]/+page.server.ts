import { dev } from '$app/environment';
import { RouteTypes, Themes } from '$enums';
import { filterByTag, isOfflineMode } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/services/requests.server';
import { supportedLocales, translations } from '$lib/translations';
import type { Post } from '$types';
import type { EntryGenerator } from './$types';

export const load = async ({ parent }) => {
  if (dev && isOfflineMode) {
    const { server } = await import('$lib/mocks/handler');
    server.listen();
  }

  const { locale, theme } = await parent();

  const tag = getTag(theme);
  const [articlesRes, highlightedArticlesRes, favoritesRes] = await Promise.all([
    getPosts<Post<string>>({ type: 'post', highlighted: false, locale, tags: tag }),
    getPosts<Post<string>>({ type: 'post', highlighted: true, locale, tags: tag }),
    getFavorites<string>({ locale, theme })
  ]);

  // 0 highlighted posts in this list
  const articles = articlesRes.data?.items?.data ?? [];
  const highlightedArticles = highlightedArticlesRes.data?.items?.data ?? [];
  const favorites = favoritesRes.data?.items?.data ?? [];

  return {
    payload: {
      articles: articles,
      highlightedArticle: highlightedArticles?.at(0),
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
