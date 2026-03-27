import { graphql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import eventsMock from './responses/events/all.json';
import type { Favorite, GraphQLResponse, Group, Post, PostType } from '$types';

const favoritesMocks = import.meta.glob<{ default: GraphQLResponse<Favorite<string>> }>(
  './responses/favorites/*.json',
  { eager: true }
);
const postsMocks = import.meta.glob<{ default: GraphQLResponse<PostType<string>> }>(
  './responses/posts/*.json',
  { eager: true }
);
const groupsMocks = import.meta.glob<{ default: GraphQLResponse<Group<string>> }>(
  './responses/groups/*.json',
  { eager: true }
);
const articlesMocks = import.meta.glob<{ default: GraphQLResponse<Post<string>> }>(
  './responses/articles/*.json',
  { eager: true }
);

const favoritesMap: Record<string, GraphQLResponse<Favorite<string>>> = {};
const postsMap: Record<string, GraphQLResponse<PostType<string>>> = {};
const groupsMap: Record<string, GraphQLResponse<Group<string>>> = {};
const articlesMap: Record<string, GraphQLResponse<Post<string>>> = {};

for (const path in favoritesMocks) {
  const filename = path.split('/').pop()?.replace('.json', ''); // ex: culture.fr
  if (filename) {
    favoritesMap[filename] = favoritesMocks[path].default;
  }
}

for (const path in postsMocks) {
  const filename = path.split('/').pop()?.replace('.json', ''); // ex: news.fr
  if (filename) {
    postsMap[filename] = postsMocks[path].default;
  }
}

for (const path in groupsMocks) {
  const filename = path.split('/').pop()?.replace('.json', ''); // ex: fr
  if (filename) {
    groupsMap[filename] = groupsMocks[path].default;
  }
}

for (const path in articlesMocks) {
  const filename = path.split('/').pop()?.replace('.json', ''); // ex: lausanne-et-le-sport-ca-match
  if (filename) {
    articlesMap[filename] = articlesMocks[path].default;
  }
}

export const handlers = [
  graphql.query('GetPosts', async ({ variables }) => {
    if (variables.type === 'press_release, press_kit') {
      console.warn('mock request: GetPosts (press)');
      const key = `press_kit.${variables.locale}`;
      const mock = postsMap[key];

      return HttpResponse.json(mock);
    } else if (variables.type === 'post') {
      if (variables.highlighted) {
        console.warn('mock request: GetPosts (highlighted posts)');
        const key = `posts.highlighted.${variables.locale}`;
        const mock = postsMap[key];

        return HttpResponse.json(mock);
      }
      console.warn('mock request: GetPosts (posts)');
      const key = `posts.${variables.locale}`;
      const mock = postsMap[key];

      return HttpResponse.json(mock);
    } else if (variables.type === 'news') {
      console.warn('mock request: GetPosts (news)');
      const key = `news.${variables.locale}`;
      const mock = postsMap[key];

      return HttpResponse.json(mock);
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
  }),
  graphql.query('GetGroup', async ({ variables }) => {
    console.warn('mock request: GetGroup');
    const mock = groupsMap[variables.locale];

    return HttpResponse.json(mock);
  }),
  graphql.query('GetFavorites', async ({ variables }) => {
    console.warn('mock request: GetFavorites');
    const key = `${variables.theme}.${variables.locale}`; // ex: "culture.fr"
    const mock = favoritesMap[key];

    return HttpResponse.json(mock);
  }),
  graphql.query('GetAgendaEvents', async () => {
    console.warn('mock request: GetAgendaEvents');
    return HttpResponse.json(eventsMock);
  }),
  graphql.query('GetArticle', async ({ variables }) => {
    console.warn('mock request: GetArticle');
    const mock = articlesMap[variables.slug];

    return HttpResponse.json(mock);
  })
];

export const server = setupServer(...handlers);
