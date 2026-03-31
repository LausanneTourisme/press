import { graphql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import eventsMock from './responses/events/all.json';
import type { Favorite, GraphQLResponse, Group, Post, PostType, Translatable } from '$types';

// lazy — files are only loaded when the handler is called
const favoritesMocks = import.meta.glob<{ default: GraphQLResponse<Favorite<string>> }>(
  './responses/favorites/*.json'
);
const postsMocks = import.meta.glob<{ default: GraphQLResponse<PostType<string>> }>(
  './responses/posts/*.json'
);
const groupsMocks = import.meta.glob<{ default: GraphQLResponse<Group<string>> }>(
  './responses/groups/*.json'
);
const articlesMocks = import.meta.glob<{ default: GraphQLResponse<Post<Translatable>> }>(
  './responses/articles/*.json'
);

export const handlers = [
  graphql.query('GetPosts', async ({ variables }) => {
    let key: string;
    if (variables.type === 'press_release, press_kit') {
      console.warn('mock request: GetPosts (press)');
      key = `press_kit.${variables.locale}`;
    } else if (variables.type === 'post') {
      if (variables.highlighted) {
        console.warn('mock request: GetPosts (highlighted posts)');
        key = `posts.highlighted.${variables.locale}`;
      } else {
        console.warn('mock request: GetPosts (posts)');
        key = `posts.${variables.locale}`;
      }
    } else if (variables.type === 'news') {
      console.warn('mock request: GetPosts (news)');
      key = `news.${variables.locale}`;
    } else {
      console.error('mock request: GetPosts (no idea...)');
      return HttpResponse.json({
        data: {
          items: {
            has_more_pages: false,
            current_page: 1,
            last_page: 1,
            per_page: 99999,
            total: 0,
            data: []
          }
        }
      });
    }
    const path = `./responses/posts/${key}.json`;
    const mock = await postsMocks[path]();
    return HttpResponse.json(mock.default);
  }),
  graphql.query('GetGroup', async ({ variables }) => {
    console.warn('mock request: GetGroup');
    const path = `./responses/groups/${variables.locale}.json`;
    const mock = await groupsMocks[path]();
    return HttpResponse.json(mock.default);
  }),
  graphql.query('GetFavorites', async ({ variables }) => {
    console.warn('mock request: GetFavorites');
    const path = `./responses/favorites/${variables.theme}.${variables.locale}.json`;
    const mock = await favoritesMocks[path]();
    return HttpResponse.json(mock.default);
  }),
  graphql.query('GetAgendaEvents', async () => {
    console.warn('mock request: GetAgendaEvents');
    return HttpResponse.json(eventsMock);
  }),
  graphql.query('GetArticle', async ({ variables }) => {
    console.warn('mock request: GetArticle');
    const path = `./responses/articles/${variables.slug}.json`;
    if (!articlesMocks[path]) {
      return HttpResponse.json({
        errors: [
          {
            message: 'Internal server error',
            locations: [{ line: 2, column: 5 }],
            path: ['item']
          }
        ],
        data: { item: null }
      });
    }
    const article = await articlesMocks[path]();
    return HttpResponse.json(article.default);
  })
];

export const server = setupServer(...handlers);
