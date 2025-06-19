import { graphql, HttpResponse, } from 'msw';
import { setupServer } from 'msw/node';

import eventsMock from './responses/events/all.json'
import articleMock from './responses/articles/culture.json'
const favoritesMocks = import.meta.glob('./responses/favorites/*.json', { eager: true });
const postsMocks = import.meta.glob('./responses/posts/*.json', { eager: true });

const favoritesMap: Record<string, any> = {};
const postsMap: Record<string, any> = {};

for (const path in favoritesMocks) {
	const filename = path.split('/').pop()?.replace('.json', ''); // ex: culture.fr
	if (filename) {
		favoritesMap[filename] = (favoritesMocks[path] as any).default;
	}
}

for (const path in postsMocks) {
	const filename = path.split('/').pop()?.replace('.json', ''); // ex: news.fr
	if (filename) {
		postsMap[filename] = (postsMocks[path] as any).default;
	}
}

export const handlers = [
    graphql.query('GetPosts', async ({ variables }) => {

        if (variables.type === 'press_release, press_kit') {
            console.warn("mock request: GetPosts (press)");
            const key = `press_kit.${variables.locale}`;
            const mock = postsMap[key];

            return HttpResponse.json(mock);
        } else if (variables.type === "post") {
            if(variables.highlighted){
                console.warn("mock request: GetPosts (highlighted posts)");
                const key = `posts.highlighted.${variables.locale}`;
                const mock = postsMap[key];

                return HttpResponse.json(mock);
            }
            console.warn("mock request: GetPosts (posts)");
            const key = `posts.${variables.locale}`;
            const mock = postsMap[key];

            return HttpResponse.json(mock);
        } else if (variables.type === "news") {
            console.warn("mock request: GetPosts (news)");
            const key = `news.${variables.locale}`;
            const mock = postsMap[key];

            return HttpResponse.json(mock);
        } else {
            console.error("mock request: GetPosts (no idea...)");
            return HttpResponse.json({
                "data": {
                    "items": {
                        "has_more_pages": false,
                        "current_page": 1,
                        "last_page": 1,
                        "per_page": 99999,
                        "total": 0,
                        "data": []
                    }
                }
            });
        }
    }),
    graphql.query('GetGroup', async ({ variables }) => {
        console.warn("mock request: GetGroup");
        // TODO
        // return HttpResponse.json(await import(`./responses/groups/posts.${variables.locale}.json`));
        return HttpResponse.json({})
    }),
    graphql.query('GetFavorites',async ({ variables }) => {
        console.warn("mock request: GetFavorites");
		const key = `${variables.theme}.${variables.locale}`; // ex: "culture.fr"
		const mock = favoritesMap[key];

        return HttpResponse.json(mock);
    }),
    graphql.query('GetAgendaEvents',async () => {
        console.warn("mock request: GetAgendaEvents");
        return HttpResponse.json(eventsMock);
    }),
    graphql.query('GetArticle', async ({ variables }) => {
        console.warn("mock request: GetArticle");
        return HttpResponse.json(articleMock)
    }),
];

export const server = setupServer(...handlers)