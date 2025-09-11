import { Forms, RouteTypes } from "$enums";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { supportedLocales, translations } from "$lib/translations";
import { fail } from '@sveltejs/kit';
import countries from 'i18n-iso-countries';
import de from "i18n-iso-countries/langs/de.json";
import en from "i18n-iso-countries/langs/en.json";
import fr from "i18n-iso-countries/langs/fr.json";
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from "./$types";
import { schemaStep4 } from "./schema";

const countriesByLocale: Record<string, any> = { en, fr, de };
const lastStep = zod4(schemaStep4);

export const load = async ({ parent }) => {
    const [{ locale }, form] = await Promise.all([
        parent(),
        superValidate(lastStep)
    ]);

    countries.registerLocale(countriesByLocale[locale]);

    return {
        countries: Object.values<string>(countries.getNames(locale, { select: "official" })).sort(),
        form,
    }
}


export const actions = {
    default: async ({ request }) => {
        const formdata = await request.formData()
        await verifyIfHuman(formdata);

        const form = await superValidate(formdata, lastStep);

        if (!form.valid) return fail(400, { form });

        return message(form, 'Form posted successfully!');
    }
}

export const entries: EntryGenerator = () => {
    const t = translations.get();

    return supportedLocales.flatMap(locale => {
        return {
            locale,
            type: t[locale][`route.${RouteTypes.Form}.slug`],
            form: t[locale][`route.${RouteTypes.Form}.${Forms.Journalist}.slug`]
        };
    });
};
