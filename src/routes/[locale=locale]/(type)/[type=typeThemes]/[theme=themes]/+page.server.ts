import { dev } from '$app/environment';
import { type RouteType, type Theme } from '$enums';
import { PUBLIC_ENABLE_OFFLINE_MODE } from '$env/static/public';
import { filterByTag } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import { type Locale } from '$lib/translations';
import type { Favorite, Post } from '$types';
import { type ServerLoad } from '@sveltejs/kit';

interface Parent {
    i18n: {
        locale: Locale,
        route: string
    },
    translations: {
        [key in Locale]: Record<string, string>
    },
    locale: Locale,
    type: RouteType,
    theme: Theme
};

export const load: ServerLoad = async ({ parent }) => {
    if(dev && PUBLIC_ENABLE_OFFLINE_MODE === "true"){
        //MOCK fetch requests
        server.listen()
    }

    const { locale, theme }: Parent = await parent() as Parent;

    const tag =  getTag(theme)
    // 0 highlighted posts in this list
    let articles: Post[]|undefined = (await getPosts({ type: 'post', highlighted: false, locale })).data?.items?.data;
    articles = filterByTag(articles ?? [], tag);
    const highlightedArticles: Post[]|undefined = (await getPosts({ type: 'post', highlighted: true, locale })).data?.items?.data;
    const highlightedArticle: Post|undefined = filterByTag(highlightedArticles ?? [], tag)[0] ?? undefined;

    const favorites: Favorite[]|undefined = (await getFavorites({ locale, theme})).data?.items?.data;

    return {
        payload: {
            articles,
            highlightedArticle,
            favorites,
        }
    }
};

