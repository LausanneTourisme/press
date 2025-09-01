import { RouteTypes, ThemeKeys, Themes, type Theme } from '$enums';
import { ThemeDetails } from '$lib/helpers/themes';
import { loadTranslations, supportedLocales } from '$lib/translations';
import type { SeoHeader } from '$types';
import { error } from 'console';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const load = async ({ params, parent, url, ...rest }) => {
    const { i18n, translations, locale, type } = await parent();
    const currentThemeType: Theme|undefined = Object.values(Themes).find(theme => translations[locale][`route.${RouteTypes.Themes}.${theme}.slug`] === params.theme)

    if(!currentThemeType) throw error(404);

    await loadTranslations(locale, url.pathname);

    const seo: SeoHeader = {
        canonical: `${PUBLIC_BASE_URL}${url.pathname}`,
        title: translations[locale][`themes.${currentThemeType}.title`],
        description: translations[locale][`themes.${currentThemeType}.meta-description`],
        image: `${PUBLIC_BASE_URL}/${ThemeDetails[ThemeKeys[currentThemeType]].image}`,
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