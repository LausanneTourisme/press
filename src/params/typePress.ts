import { RouteTypes } from "$enums";
import { locale, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    const lang = locale.get()

    if (!lang) return false;

    // same page but displaying another title
    const validTypes = [
        translations.get()[lang][`route.type.${RouteTypes.Presskit}.slug`],
        translations.get()[lang][`route.type.${RouteTypes.Pressrelease}.slug`],
    ]

    return validTypes.includes(param);
}