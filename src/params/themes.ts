import { Themes } from "$enums";
import { locale, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    const lang = locale.get()
    const themes: string[] = Object.values(Themes).map(theme => translations.get()[lang][`route.type.themes.${theme}.slug`]);

    return themes.includes(param);
}