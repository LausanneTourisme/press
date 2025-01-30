import { RouteTypes } from "$enums";
import { locale, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    const lang = locale.get()

    if (!lang) return false;

    return translations.get()[lang][`route.type.${RouteTypes.Coverage}.slug`] === param;
}