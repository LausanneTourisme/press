import { Themes, type Theme } from "$enums";
import { GRAPHQL_AGENDA_TOKEN, GRAPHQL_AGENDA_URL, GRAPHQL_TOKEN, GRAPHQL_URL, GROUP_ID_PAGE_HIGHLIGHTS } from "$env/static/private";
import type { Locale } from "$lib/translations";
import moment from "moment";

const itemsLimit = 9999
const getTag = (theme: Theme): string => {
    switch (theme) {
        case Themes.Architecture:
            return 'architecture';
        case Themes.Culture:
            return 'culture';
        case Themes.Education:
            return 'éducation';
        case Themes.Family:
            return 'famille';
        case Themes.Gastronomy:
            return 'gastronomie';
        case Themes.Lacustrine:
            return 'lacustre';
        case Themes.Nature:
            return 'nature';
        case Themes.Sport:
            return 'sport';
        case Themes.Sustainability:
            return 'durabilité';
        case Themes.Unusual:
            return 'insolite';
        case Themes.Wellness:
            return 'bien-être';
        default:
            return theme;
    }
}
export const getPosts = async ({ type, locale, highlighted }: { type: 'press_release' | 'post' | 'news', locale: Locale, highlighted: boolean }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            variables: {
                type: type === 'press_release' ? 'press_release, press_kit' : type,
                locale,
                limit: itemsLimit,
                highlighted,
            },
            query: `query GetPosts($limit: Int, $locale: String, $type: String, $highlighted: Boolean) {
                posts(type: $type, locale: $locale, limit: $limit, highlighted: $highlighted) {
                    data {
                        id
                        languages
                        author
                        name
                        type
                        lead
                        summary
                        highlight
                        link
                        content
                        medias(cover:true) {
                            cloudinary_id
                            copyright
                            public_name
                        }
                        published_at
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
            }`,
        }),
    });
    return await result.json();
}

/**
 * this request call a specific group from SIT, see global env GROUP_ID_PAGE_HIGHLIGHTS
 */
export const getGroup = async ({ locale }: { locale: Locale }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            variables: {
                id: GROUP_ID_PAGE_HIGHLIGHTS,
                locale
            },
            query: `query GetGroup ($id: Int!, $locale: String) {
                group(id: $id, locale: $locale) {
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
    return await result.json();
}

export const getFavorites = async ({ locale, tag }: { locale: Locale, tag: Theme }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            variables: {
                locale,
                limit: 100,
                tag: tag, //used for mocks
                tags: [getTag(tag)],
            },
            query: `query GetFavorites ($locale: String, $limit: Int, $tags: [String] ) {
                favorites(locale: $locale, limit: $limit, page: 1, tags: $tags) {
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
            }`,
        }),
    });
    return await result.json();
}

export const getAgendaEvents = async () => {
    const result = await fetch(`${GRAPHQL_AGENDA_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_AGENDA_TOKEN}`
        },
        body: JSON.stringify({
            variables: {
                from: moment().format('YYYY-MM-DD'),
                highlighted: true,
                limit: itemsLimit,
            },
            query: `GetAgendaEvents ($from:String, highlighted: $highlighted, limit: Int) {
                events(from: $from, highlighted: $highlighted, limit: $limit) {
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
            }`,
        }),
    });

    return await result.json();
}
