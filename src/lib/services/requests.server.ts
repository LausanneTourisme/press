import { Themes, type Theme } from '$enums';
import { GRAPHQL_AGENDA_TOKEN, GRAPHQL_TOKEN, GRAPHQL_URL } from '$env/static/private';
import { dev } from '$app/environment';
import type { Locale } from '$lib/translations';
import type { Event, Favorite, GraphQLResponse, Group, Post, PostType, Translatable } from '$types';
import { DateTime } from 'luxon';

const itemsLimit = 9999;

type FetchFn = typeof fetch;

const baseHeaders = (typeRequests: 'agenda' | 'normal' = 'normal') => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${typeRequests === 'agenda' ? GRAPHQL_AGENDA_TOKEN : GRAPHQL_TOKEN}`,
  // ...(dev && { 'cache-control': 'no-cache' })
});

export const getTag = (theme: Theme): string => {
  switch (theme) {
    case Themes.Architecture:
      return 'lt-architecture';
    case Themes.Culture:
      return 'lt-culture';
    case Themes.Education:
      return 'lt-education';
    case Themes.Family:
      return 'lt-famille';
    case Themes.Gastronomy:
      return 'lt-gastronomie';
    case Themes.Lacustrine:
      return 'lt-lacustre';
    case Themes.Nature:
      return 'lt-nature';
    case Themes.Sport:
      return 'lt-sport';
    case Themes.Sustainability:
      return 'lt-durabilite';
    case Themes.Unusual:
      return 'lt-insolite';
    case Themes.Wellness:
      return 'lt-bien-etre';
    default:
      return theme;
  }
};

export const getPosts = async <T extends PostType<string | Translatable>>({
  type,
  locale,
  highlighted,
  tags,
  operator,
  fetchFn = fetch
}: {
  type: 'press_release' | 'post' | 'news';
  locale?: Locale;
  highlighted?: boolean;
  tags?: string;
  operator?: 'some' | 'all' | 'not';
  fetchFn?: FetchFn;
}) => {
  const result = await fetchFn(`${GRAPHQL_URL}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      variables: {
        type: type === 'press_release' ? 'press_release, press_kit' : type,
        locale,
        limit: itemsLimit,
        highlighted,
        tags,
        operator
      },
      query: `query GetPosts($limit: Int, $locale: String, $type: String, $highlighted: Boolean, $tags: String, $operator: press_tags_operator) {
                items: posts(limit: $limit, locale: $locale, type: $type, highlighted: $highlighted, tags: $tags, tags_operator: $operator) {
                    data {
                        id
                        languages
                        author
                        name
                        type
                        lead
                        summary
                        highlight
                        published_at
                        link
                        medias(cover:true) {
                            cloudinary_id
                            copyright
                            public_name
                        }
                        seo {
                            description
                            noindex
                            slug
                        }
                        tags {
                            name
                            public_name
                        }
                    }
                }
            }`
    })
  });
  return (await result.json()) as Promise<GraphQLResponse<T>>;
};

/**
 * this request call a specific group from SIT, see global env GROUP_ID_PAGE_HIGHLIGHTS
 */
export const getGroup = async <T extends string | Translatable>({
  locale,
  id,
  fetchFn = fetch
}: {
  locale: Locale;
  id: number;
  fetchFn?: FetchFn;
}) => {
  const result = await fetchFn(`${GRAPHQL_URL}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      variables: {
        id,
        locale
      },
      query: `query GetGroup ($id: Int!, $locale: String) {
                item:group(id: $id, locale: $locale) {
                    pois {
                        id
                        name
                        lead
                        medias(cover:true) {
                            cloudinary_id
                            copyright
                            public_name
                        }
                        seo {
                            slug
                            hreflang
                        }
                    }
                }
            }`
    })
  });
  return (await result.json()) as Promise<GraphQLResponse<Group<T>>>;
};

export const getFavorites = async <T extends Translatable | string>({
  locale,
  theme,
  fetchFn = fetch
}: {
  locale: Locale;
  theme: Theme;
  fetchFn?: FetchFn;
}) => {
  const result = await fetchFn(`${GRAPHQL_URL}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      variables: {
        locale,
        limit: 100,
        theme, //used for mocks
        tags: [getTag(theme)]
      },
      query: `query GetFavorites ($locale: String, $limit: Int, $tags: [String] ) {
                items: favorites(locale: $locale, limit: $limit, page: 1, tags: $tags) {
                    data {
                        id
                        name
                        content
                        lausanner {
                            id
                            name
                            seo {
                                slug
                            }
                            medias {
                                cloudinary_id
                                copyright
                                public_name
                            }
                        }
                        pois {
                            id
                            name
                            lead
                            medias(cover:true) {
                                cloudinary_id
                                copyright
                                public_name
                            }
                            seo {
                                slug
                                hreflang
                            }
                            geolocations {
                                latitude
                                longitude
                            }
                        }
                    }
                }
            }`
    })
  });
  return (await result.json()) as Promise<GraphQLResponse<Favorite<T>>>;
};

export const getAgendaEvents = async ({ fetchFn = fetch }: { fetchFn?: FetchFn } = {}) => {
  const result = await fetchFn(`${GRAPHQL_URL}`, {
    method: 'POST',
    headers: baseHeaders('agenda'),
    body: JSON.stringify({
      variables: {
        from: DateTime.now().toSQLDate(),
        highlighted: true,
        limit: itemsLimit
      },
      query: `query GetAgendaEvents ($from: String, $highlighted: Boolean, $limit: Int) {
                items: events(from: $from, highlighted: $highlighted, limit: $limit) {
                    data {
                        id
                        name
                        lead
                        languages
                        highlight
                        schedules {
                            dates {
                                label
                                every_year
                                open_days
                                week {
                                    days
                                    times {
                                        start
                                        end
                                    }
                                }
                                periods {
                                    start
                                    end
                                }
                            }
                            exceptions {
                                range {
                                    from
                                    to
                                }
                                dates {
                                    start
                                    end
                                    type
                                    open_days
                                week {
                                    days
                                        times {
                                            start
                                            end
                                        }
                                    }
                                }
                            }
                        }
                        medias {
                            is_cover
                            cloudinary_id
                            copyright
                            public_name
                        }
                        seo {
                            slug
                            hreflang
                        }
                        tags {
                            id
                            name
                            public_name
                        }
                    }
                }
            }`
    })
  });

  return (await result.json()) as Promise<GraphQLResponse<Event<Translatable>>>;
};

export const getPost = async (slug: string, fetchFn: FetchFn = fetch) => {
  const result = await fetchFn(`${GRAPHQL_URL}`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({
      variables: {
        slug
      },
      query: `query GetArticle($id: Int, $slug: String, $locale: String){
                item: post(id: $id, slug: $slug locale: $locale){
                    id
                    languages
                    name
                    lead
                    summary
                    content
                    medias(cover:true) {
                        cloudinary_id
                        copyright
                        public_name
                    }
                    published_at
                    seo
                    {
                        description
                        noindex
                        slug
                    }
                    tags {
                        name
                        public_name
                    }
                }
            }`
    })
  });

  return (await result.json()) as Promise<GraphQLResponse<Post<Translatable>>>;
};
