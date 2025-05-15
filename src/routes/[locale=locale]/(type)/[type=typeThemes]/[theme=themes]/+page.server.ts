import { dev } from '$app/environment';
import { filterByTag, isOfflineMode } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import type { Post } from '$types';

export const load = async ({ parent }) => {
    if (dev && isOfflineMode) {
        //MOCK fetch requests
        server.listen()
    }

    const { locale, theme } = await parent();

    const tag = getTag(theme)
    const [articlesRes, highlightedArticlesRes, favoritesRes] = await Promise.all([
        getPosts<Post<string>>({ type: 'post', highlighted: false, locale }),
        getPosts<Post<string>>({ type: 'post', highlighted: true, locale }),
        getFavorites<string>({ locale, theme }),
    ]);

    // 0 highlighted posts in this list
    const articles = articlesRes.data?.items?.data;
    const highlightedArticles = highlightedArticlesRes.data?.items?.data;
    const favorites = favoritesRes.data?.items?.data;
    
    return {
        payload: {
            articles: filterByTag(articles ?? [], tag),
            highlightedArticle: filterByTag(highlightedArticles ?? [], tag)?.at(0),
            favorites,
        }
    }
};
