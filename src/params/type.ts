import { RouteType } from "$enums";
import { locale, t, translations } from "$lib/translations";

export const match = (param: string): boolean => {
    const lang = locale.get()
    const types = Object.values(RouteType).map(type => translations.get()[lang][`route.type.${type}.slug`]);
    
    return types.includes(param);
}