import { graphql, HttpResponse, } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
    graphql.query('GetPosts', async ({ variables }) => {
        if (variables.type === 'press_release, press_kit') {
            return HttpResponse.json(await import(`./responses/posts/press_kit.${variables.locale}.json`));
        } else if (variables.type === "post") {
            if(variables.highlighted){
                return HttpResponse.json(await import(`./responses/posts/posts.highlighted.${variables.locale}.json`));
            }
            return HttpResponse.json(await import(`./responses/posts/posts.${variables.locale}.json`));
        } else if (variables.type === "news") {
            return HttpResponse.json(await import(`./responses/posts/news.${variables.locale}.json`));
        } else {
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
        return HttpResponse.json(await import(`./responses/groups/posts.${variables.locale}.json`));
    }),
    graphql.query('GetFavorites',async ({ variables }) => {
        return HttpResponse.json(await import(`./responses/favorites/${variables.theme}.${variables.locale}.json`));
    }),
    graphql.query('GetAgendaEvents',async () => {
        return HttpResponse.json(await import(`./responses/events/all.json`));
    }),
];

export const server = setupServer(...handlers)