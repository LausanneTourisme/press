import { dev } from '$app/environment';
import { type RouteType, type Theme } from '$enums';
import { filterByTag } from '$lib/helpers';
import { getFavorites, getPosts, getTag } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import { type Locale } from '$lib/translations';
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
    if(dev){
        //MOCK fetch requests
        server.listen()
    }

    const { locale, theme }: Parent = await parent() as Parent;

    const tag =  getTag(theme)
    // 0 highlighted posts in this list
    let articles = await getPosts({ type: 'post', highlighted: false, locale });
    articles = filterByTag(articles?.data?.items?.data ?? [], tag);
    const highlightedArticles = await getPosts({ type: 'post', highlighted: true, locale });
    const highlightedArticle = filterByTag(highlightedArticles?.data?.items?.data ?? [], tag)[0] ?? undefined;

    const favorites = await getFavorites({ locale, theme});

    return {
        payload: {
            articles,
            highlightedArticle,
            favorites,
        }
    }
};

