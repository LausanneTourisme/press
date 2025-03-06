import { RouteTypes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    return supportedLocales.flatMap(lang => [
        translations.get()[lang][`route.type.${RouteTypes.Presskit}.slug`],
        translations.get()[lang][`route.type.${RouteTypes.Pressrelease}.slug`],
    ]).includes(param);
}