import { addTranslations, loadTranslations, setLocale, setRoute } from '$lib/translations';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	const { i18n, translations } = data;
	const { locale, route } = i18n;

	addTranslations(translations);
	await Promise.all([
		setRoute(route),
		setLocale(locale),
		loadTranslations(locale),
	]);

	return data;
};
