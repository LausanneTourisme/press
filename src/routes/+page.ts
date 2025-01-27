// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;
import { addTranslations, setLocale, setRoute } from '$lib/translations';

export const load = async ({ data }) => {
	const { i18n, translations } = data;
	const { lang, route } = i18n;
	addTranslations(translations);

	await setRoute(route);
	await setLocale(lang);

	return {
        locale: lang,
		i18n: {lang, route}
	};
};
