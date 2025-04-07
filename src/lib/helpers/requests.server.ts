import { GRAPHQL_AGENDA_TOKEN, GRAPHQL_AGENDA_URL, GRAPHQL_TOKEN, GRAPHQL_URL } from "$env/static/private";
import type { Locale } from "$lib/translations";
import moment from "moment";

const itemsLimit = 9999

export const getPosts = async ({ type, locale, highlighted }: { type: 'press_release' | 'post' | 'news', locale: Locale, highlighted: boolean }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            query: `{
            posts(type: "${type === 'press_release' ? 'press_release, press_kit' : type}", locale: "${locale}", limit: ${itemsLimit}, highlighted: ${highlighted}) {
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


export const getGroups = async ({ id, locale }: { id: number, locale: Locale }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            query: `{
            group(id: ${id} locale: "${locale}") {
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

export const getFavorites = async ({ locale, tag }: { locale: Locale, tag: string }) => {
    const result = await fetch(`${GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GRAPHQL_TOKEN}`
        },
        body: JSON.stringify({
            query: `{
            favorites(locale: "${locale}", limit: 100, page: 1, tags: ["${tag}"]) {
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
            query: `{
            events(from: "${moment().format('YYYY-MM-DD')}", highlighted: true, limit: ${itemsLimit}) {
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
