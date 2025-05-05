import { RouteTypes, ThemeKeys, Themes, type RouteType, type Theme } from '$enums';
import { ThemeDetails } from '$lib/helpers/themes';
import { loadTranslations, supportedLocales, type Locale } from '$lib/translations';
import type { SeoHeader } from '$types';
import { type ServerLoad } from '@sveltejs/kit';
import { error } from 'console';

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
    const currentThemeType: Theme|undefined = Object.values(Themes).find(theme => translations[locale][`route.${RouteTypes.Themes}.${theme}.slug`] === params.theme)

    if(!currentThemeType) throw error(404);

    await loadTranslations(locale, url.pathname);

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: translations[locale][`themes.${currentThemeType}.title`],
        description: translations[locale][`themes.${currentThemeType}.meta-description`],
        image: `${url.origin}/${ThemeDetails[ThemeKeys[currentThemeType]].image}`, //TODO add picture please
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
    };
};