import { RouteTypes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    return supportedLocales.flatMap(lang => [
        translations.get()[lang][`route.${RouteTypes.Presskit}.slug`],
        translations.get()[lang][`route.${RouteTypes.Pressrelease}.slug`],
    ]).includes(param);
}