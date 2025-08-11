import { RouteTypes, Themes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import type { EntryGenerator } from "./$types";

export const entries: EntryGenerator = () => {
    const t = translations.get();

    return supportedLocales.flatMap(locale => {
        const type = t[locale][`route.${RouteTypes.Themes}.slug`];
        return {
            locale,
            type,
        }
    })
};