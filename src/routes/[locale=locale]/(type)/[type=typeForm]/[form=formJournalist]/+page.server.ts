import { Forms, RouteTypes } from "$enums";
import { supportedLocales, translations } from "$lib/translations";
import countries from 'i18n-iso-countries';
import de from "i18n-iso-countries/langs/de.json";
import en from "i18n-iso-countries/langs/en.json";
import fr from "i18n-iso-countries/langs/fr.json";
import { message, superValidate, type Infer } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from "./$types";
import { schemaStep1, schemaStep2, schemaStep3, schemaStep4 } from "./schema";

type Message = { step: number; message?: string };
const countriesByLocale: Record<string, any> = { en, fr, de };
const steps = [zod(schemaStep1), zod(schemaStep2), zod(schemaStep3), zod(schemaStep4)]
const lastStep = zod(schemaStep4);

export const load = async ({ parent }) => {
    const [{ locale }, form] = await Promise.all([
        parent(),
        superValidate<Infer<typeof schemaStep4>, Message>(lastStep)
    ]);

    countries.registerLocale(countriesByLocale[locale]);

    return {
        countries: Object.values<string>(countries.getNames(locale, { select: "official" })).sort(),
        form,
    }
}


export const actions = {
    default: async ({ request }) => {
        const formData = await request.formData()
        console.log({ formData })

        const step = +(formData.get('step') ?? 0);
        const form = await superValidate(formData, steps[step]);
        return message(form, { oldStep: step, text: 'Form posted successfully!', step: (step + 1) % 4 });
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