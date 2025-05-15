
export const load = async ({ params, parent, url, ...rest }) => {
    const { i18n, translations, locale, type, seo } = await parent();
    
    return {
        i18n,
        translations,
        locale,
        type,
        id: Number(params.id!),
    };
};