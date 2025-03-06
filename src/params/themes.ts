import { Themes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    return supportedLocales.flatMap(lang => Object.values(Themes).map(theme => translations.get()[lang][`route.type.themes.${theme}.slug`])).includes(param);
}