import { dev } from '$app/environment';
import { RouteTypes } from '$enums';
import { Cloudinary } from '$lib/cloudinary';
import { isOfflineMode } from '$lib/helpers';
import { getPost } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader, Translatable } from '$types';
import { error } from '@sveltejs/kit';

export const load = async ({ params, parent, url, ...rest }) => {
    if (dev && isOfflineMode) {
        //MOCK fetch requests
        server.listen()
    }

    const [{ i18n, translations, locale, type }, articleRes] = await Promise.all([
        parent(),
        getPost(params.slug ?? ''),
    ]);

    const article = articleRes.data.item;

    if (!article || !article.languages?.includes(locale)) throw error(404);

    await loadTranslations(locale, url.pathname);

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: article.name?.[locale as Locale] ?? translations[locale][`page.title`],
        description: article.lead?.[locale as Locale] ?? translations[locale][`page.meta-description`],
        image: Cloudinary.make(article.medias?.at(0)?.cloudinary_id ?? '').url({ h: 720, w: 1280 }),
        alternate: supportedLocales.filter(l => article.languages?.includes(l)).map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Articles}.slug`]}/${article.seo?.slug?.[locale]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale,
        type,
        article
    };
};