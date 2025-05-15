import { dev } from '$app/environment';
import { filterByTag, isOfflineMode } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import type { Favorite, Post } from '$types';

export const load = async ({ parent }) => {
    if (dev && isOfflineMode) {
        //MOCK fetch requests
        server.listen()
    }

    const { locale, theme } = await parent();

    const tag = getTag(theme)
    const [articlesRes, highlightedArticlesRes, favoritesRes] = await Promise.all([
        getPosts({ type: 'post', highlighted: false, locale }),
        getPosts({ type: 'post', highlighted: true, locale }),
        getFavorites({ locale, theme }),
    ]);

    // 0 highlighted posts in this list
    const articles: Post<string>[] | undefined = articlesRes.data?.items?.data;
    const highlightedArticles: Post<string>[] | undefined = highlightedArticlesRes.data?.items?.data;
    const favorites: Favorite<string>[] | undefined = favoritesRes.data?.items?.data;

    return {
        payload: {
            articles: filterByTag<string>(articles ?? [], tag),
            highlightedArticle: filterByTag<string>(highlightedArticles ?? [], tag)?.at(0),
            favorites,
        }
    }
};
