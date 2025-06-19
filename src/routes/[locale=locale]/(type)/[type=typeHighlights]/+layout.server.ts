import { RouteTypes } from '$enums';
import { GROUP_ID_PAGE_HIGHLIGHTS } from '$env/static/private';
import { getAgendaEvents, getGroup, getPosts } from '$lib/helpers/requests.server.js';
import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { News, SeoHeader } from '$types';

export const load = async ({ url, params, parent }) => {
    const { i18n, translations } = await parent();

    const lang = params.locale as Locale;

    const [eventsRes, groupRes, newsRes] = await Promise.all([
        getAgendaEvents(),
        getGroup<string>({ locale: lang, id: Number(GROUP_ID_PAGE_HIGHLIGHTS) }),
        getPosts<News<string>>({ type: 'news', locale: lang }),
        loadTranslations(lang, url.pathname)
    ]);

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[lang][`page.title`],
        description: translations[lang][`page.meta-description`],
        image: '', //TODO add picture please
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Highlights}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        type: RouteTypes.Highlights,
        events: eventsRes.data.items?.data ?? [],
        group: groupRes.data.item,
        news: newsRes.data.items?.data ?? [],
    };
};