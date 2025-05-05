import { dev } from '$app/environment';
import { RouteTypes, type RouteType } from '$enums';
import { Cloudinary } from '$lib/cloudinary';
import { isOfflineMode } from '$lib/helpers';
import { getArticle } from '$lib/helpers/requests.server';
import { server } from '$lib/mocks/handler';
import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, supportedLocales, translations, type Locale } from '$lib/translations';
import type { Post, SeoHeader, Translatable } from '$types';
import { error, redirect, type ServerLoad } from '@sveltejs/kit';

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
};

export const load: ServerLoad = async ({ params, parent, url, ...rest }) => {
    if (dev && isOfflineMode) {
        //MOCK fetch requests
        server.listen()
    }

    const { i18n, translations, locale, type }: Parent = await parent() as Parent;
    const article: Post | undefined = (await getArticle(params.slug ?? '')).data.item;

    if (!article) throw error(404);

    await loadTranslations(locale, url.pathname);
    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: (article.name as undefined | Translatable)?.[locale] ?? translations[locale][`page.title`],
        description: (article.lead as undefined | Translatable)?.[locale] ?? translations[locale][`page.meta-description`],
        image: Cloudinary.make(article.medias?.at(0)?.cloudinary_id ?? '').url({ h: 720, w: 1280 }),
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Articles}.slug`]}/${(article.seo?.slug as undefined | Translatable)?.[locale]}`
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