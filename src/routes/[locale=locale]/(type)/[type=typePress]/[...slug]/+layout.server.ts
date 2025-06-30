import { RouteTypes } from '$enums';
import { Cloudinary } from '$lib/cloudinary.js';
import { getPost } from '$lib/helpers/requests.server.js';
import { supportedLocales, type Locale } from '$lib/translations/index.js';
import type { SeoHeader } from '$types';
import { error } from '@sveltejs/kit';

export const load = async ({ params, parent, url, ...rest }) => {

    const [{ i18n, translations }, releaseRes] = await Promise.all([
        parent(),
        getPost(params.slug ?? ''),
    ]);

    const release = releaseRes.data.item;
    if (!release || !release.languages?.includes(params.locale)) throw error(404);

    const lang = params.locale as Locale;
    const type = translations[lang][`route.${RouteTypes.Presskit}.slug`] === params.type ? RouteTypes.Presskit : RouteTypes.Pressrelease;

    const seo: SeoHeader = {
        canonical: `${url.origin}${url.pathname}`,
        title: release.name?.[lang as Locale] ?? translations[lang][`page.title`],
        description: release.lead?.[lang as Locale] ?? translations[lang][`page.meta-description`],
        image: Cloudinary.make(release.medias?.at(0)?.cloudinary_id ?? 'default').url({ h: 720, w: 1280 }),
        alternate: supportedLocales.filter(l => release.languages?.includes(l)).map(locale => ({
            hreflang: locale,
            href: `/${locale}/${translations[locale][`route.${type}.slug`]}/${release.seo?.slug?.[locale]}`
        })),
    }

    return {
        i18n,
        translations,
        seo,
        locale: lang,
        release,
        type,
    };
};