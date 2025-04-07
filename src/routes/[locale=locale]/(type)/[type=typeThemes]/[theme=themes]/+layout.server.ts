import { RouteTypes, Themes, type RouteType } from '$enums';
import { ucfirst } from '$lib/helpers';
import { getFavorites, getPosts } from '$lib/helpers/requests.server';
import { defaultLocale, isValidLocale, loadTranslations, locale, locales, setLocale, supportedLocales, translations as libTranslations, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
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
    const { i18n, translations, locale, type }: Parent = await parent() as Parent;
    const currentThemeType = Object.values(Themes).find(theme => translations[locale][`route.${RouteTypes.Themes}.${theme}.slug`] === params.theme)

    const articles = await getPosts({ type: 'post', highlighted: false, locale });
    const highlightedPosts = await getPosts({ type: 'post', highlighted: true, locale });
    const favorites = await getFavorites({ locale, tag: ucfirst(translations['fr'][`route.${RouteTypes.Themes}.${currentThemeType}.slug`]) })

    await loadTranslations(locale, url.pathname);

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[locale][`themes.${currentThemeType}.title`],
        description: translations[locale][`page.meta-description`],
        image: '', //TODO add picture please
        alternate: supportedLocales.map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${RouteTypes.Themes}.slug`]}/${translations[locale][`route.${RouteTypes.Themes}.${currentThemeType}.slug`]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale,
        type,
        theme: currentThemeType,
        payload: {
            articles,
            highlightedPosts,
            favorites,
        }
    };
};