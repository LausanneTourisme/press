
export const load = async ({ params, parent, url, ...rest }) => {
    const { i18n, translations, locale, type, id, seo } = await parent();
    
    return {
        i18n,
        translations,
        seo,
        locale,
        type,
        id,
    };
};