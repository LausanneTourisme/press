import { RouteTypes } from "$enums";
import { locale, translations } from "$lib/translations";
import type { ParamMatcher } from "@sveltejs/kit";

export const match: ParamMatcher = (param: string): boolean => {
    const lang = locale.get()
    const types: string[] = Object.values(RouteTypes).map(type => translations.get()[lang][`route.type.${type}.slug`]);

    return types.includes(param);
}