import { addTranslations, loadTranslations, setLocale, setRoute } from '$lib/translations';

export const load = async ({ data }) => {
	const { i18n, translations } = data;
	const { locale, route } = i18n;

	addTranslations(translations);

	await setRoute(route);
	await setLocale(locale);
	await loadTranslations(locale); 

	return data;
};
