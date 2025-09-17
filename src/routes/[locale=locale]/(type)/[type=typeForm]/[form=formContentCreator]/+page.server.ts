import { Forms, MediaTypes, RouteTypes } from "$enums";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { supportedLocales, translations, type Locale } from "$lib/translations";
import type { MediaProfileJournalist } from "$types/forms";
import { fail, redirect } from '@sveltejs/kit';
import type { Translations } from '@sveltekit-i18n/base';
import countries from 'i18n-iso-countries';
import de from "i18n-iso-countries/langs/de.json";
import en from "i18n-iso-countries/langs/en.json";
import fr from "i18n-iso-countries/langs/fr.json";
import { setFlash } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from "./$types";
import { schemaStep4 } from "./schema";
import { sendEmail } from "$lib/helpers/mails.server";
import { DateTime } from "luxon";

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
  default: async ({ request, params, cookies },) => {
    const t = translations.get();
    const formdata = await request.formData()
    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, lastStep);

    if (!form.valid) return fail(400, { form });


    const html = generateMailContent({ data: form.data as MediaProfileJournalist, userLocale: params.locale as Locale, translations: t })
    const { internal_reponse } = await sendEmail({
      intern_mail: {
        from_name: "No Reply - Press",
        subject: "[Formulaire] - Createur de contenu",
        html
      }
    })
    if (internal_reponse[0].status === 'sent') {
      return redirect(303, `/${params.locale}/${t[params.locale][`route.${RouteTypes.Form}.slug`]}/${t[params.locale][`route.${RouteTypes.Form}.${Forms.Thanks}.slug`]}`)
    }

    setFlash({
      type: 'error',
      message: t[params.locale][`${RouteTypes.Form}.error-on-sending`] ?? ''
    }, cookies)
    return fail(500, { form, message: "Please retry later." });
  }
}

export const entries: EntryGenerator = () => {
  const t = translations.get();

  return supportedLocales.flatMap(locale => {
    return {
      locale,
      type: t[locale][`route.${RouteTypes.Form}.slug`],
      form: t[locale][`route.${RouteTypes.Form}.${Forms.ContentCreator}.slug`]
    };
  });
};


const generateMailContent = ({ data, userLocale, translations }: { data: MediaProfileJournalist, userLocale: Locale, translations: Translations.SerializedTranslations }) => {


  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire journaliste</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire journaliste</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${translations['fr'][`lang.${userLocale}`]}</h2>
`;

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Informations de voyage</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Départ :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0"><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Ville :</span> <span>${data.travelInformation?.departurePoint?.city ?? ''}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Pays :</span> <span>${data.travelInformation?.departurePoint?.country ?? ''}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Trajet aller :</span> <span>${data.travelInformation?.departurePoint?.outwardJourney?.replaceAll('\n', ', ') ?? ''}</span></li></ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Retour :</span> <span>${data.travelInformation?.returnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Réduction sur les transports suisses :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelInformation?.travelReductions?.map(x => `<li>${translations['fr'][`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${x}`]}</li>`).join("")}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Dernière date de visite à Lausanne/en Suisse :</span> <span>${data.travelInformation?.lastVisit ? DateTime.fromSQL(data.travelInformation.lastVisit).toFormat('dd.MM.yyyy') : ''}</span></div>
  </section>
`

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Informations personnelles</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Titre :</span> <span>${translations['fr'][`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${data.personalInformation.title}`]}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Prénom :</span> <span>${data.personalInformation?.firstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Nom :</span> <span>${data.personalInformation?.lastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Date de naissance :</span> <span>${DateTime.fromSQL(data.personalInformation.birthday!).toFormat('dd.MM.yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Téléphone :</span> <span>${data.personalInformation?.phoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Email :</span> <span>${data.personalInformation?.email ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Adresse :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0"><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Adresse :</span> <span>${data.personalInformation.address.streetAddress}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Ville :</span> <span>${data.personalInformation.address.city}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">ZIP :</span> <span>${data.personalInformation.address.postalcode}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Pays :</span> <span>${data.personalInformation.address.country}</span></li></ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Langues parlées :</span> <span>${data.personalInformation?.spokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Freelance :</span> <span>${data.personalInformation.freelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Passport :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0"><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Numéro :</span> <span>${data.personalInformation?.passport?.number}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Validité :</span> <span>${data.personalInformation?.passport?.validity ? DateTime.fromSQL(data.personalInformation.passport.validity).toFormat('dd.MM.yyyy') : ''}</span></li></ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Contacts d'urgence :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.personalInformation?.emergencyContacts?.map(x => `<li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Nom :</span> <span>${x.name}</span></li><li><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Numéro de téléphone :</span> <span>${x.phoneNumber}</span></li>`) ?? ''}</ul></div>
  </section>
`

  html += `<!-- Divers -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Informations complémentaires</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Assurance de voyage couvrant la Suisse :</span> <span>${data.travelInsuranceCoveringSwitzerland ? 'Oui' : 'Non'}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">A lu les termes d'acceptation :</span> <span>${data.readTermsOfAcceptance ? 'Oui' : 'Non'}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Remarques :</span> <span>${data.remarks ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Newsletter :</span> <span>${data.newsletter ? 'Oui' : 'Non'}</span></div>
  </section>
</body>
</html>
  `

  return html;
}
