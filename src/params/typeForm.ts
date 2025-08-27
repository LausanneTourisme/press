import { Forms, RouteTypes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    return supportedLocales.flatMap(lang => translations.get()[lang][`route.${RouteTypes.Form}.slug`]).includes(param);
}