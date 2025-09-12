import { Forms, MediaTypes, RouteTypes } from "$enums";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { supportedLocales, translations, type Locale } from "$lib/translations";
import type { MediaProfileJournalist } from "$types";
import { fail } from '@sveltejs/kit';
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
                subject: "[Formulaire] - Journaliste",
                html
            }
        })
        if (internal_reponse[0].status === 'sent') {
            return message(form, 'Form posted successfully!');
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
            form: t[locale][`route.${RouteTypes.Form}.${Forms.Journalist}.slug`]
        };
    });
};


const generateMailContent = ({ data, userLocale, translations }: { data: MediaProfileJournalist, userLocale: Locale, translations: Translations.SerializedTranslations }) => {


    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire journaliste</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; }
    h1 { text-align: center; margin-bottom: 2rem; }
    section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
    h2 { margin-top: 0; color: #444; font-size: 1.2rem; }
    .field { margin: 0.3rem 0; }
    .label { font-weight: 600; margin-right: 0.5rem; }
    .value-empty { color: #aaa; font-style: italic; }
    ul { margin: 0.5rem 0 0 1.2rem; padding: 0; }
  </style>
</head>
<body>
  <h1>Formulaire journaliste</h1>
  <h2>Langue du formulaire: ${userLocale}

  <!-- Médias -->
  <section>
    <h2>Média</h2>
    <div class="field"><span class="label">Nom :</span> <span>${data.mediaName}</span></div>
    <div class="field"><span class="label">Thématique :</span> <span>${data.thematic}</span></div>
    <div class="field"><span class="label">Profil d’audience :</span> <span>${data.audienceProfile}</span></div>
    <div class="field"><span class="label">Types :</span> <span>${data.mediaTypes.map(x => translations['fr'][`${RouteTypes.Form}.${Forms.Journalist}.form.types.${x}`]).join(', ')}</span></div>
  </section>
`
    // statistics of the media
    if (data.mediaTypes?.includes(MediaTypes.Print)) {
        html += `<!-- Statistiques Print -->
  <section>
    <h2>Statistiques Print</h2>
    <div class="field"><span class="label">Lieu de diffusion :</span> <span>${data.printMediaStatistics.broadcastLocation}</span></div>
    <div class="field"><span class="label">Circulation/nombre d'exemplaires :</span> <span>${data.printMediaStatistics.copies}</span></div>
    <div class="field"><span class="label">Couverture/nombre de lecteurs :</span> <span>${data.printMediaStatistics.readers}</span></div>
  </section>
        `
    }
    if (data.mediaTypes?.includes(MediaTypes.Online)) {
        html += `<!-- Statistiques Online -->
  <section>
    <h2>Statistiques du média online (site web)</h2>
    <div class="field"><span class="label">Site web :</span> <span>${data.onlineMediaStatistics.website}</span></div>
    <div class="field"><span class="label">Reach/visiteurs uniques par mois :</span> <span>${data.onlineMediaStatistics.monthlyUniqueVisitors}</span></div>
    <div class="field"><span class="label">Nombre de page vues par mois :</span> <span>${data.onlineMediaStatistics.montlhyPageViews}</span></div>
  </section>
        `
    }
    if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
        html += `<!-- Statistiques TV/Radio -->
  <section>
    <h2>Statistique du média radio/TV</h2>
    <div class="field"><span class="label">Nom de l'émission :</span> <span>${data.radioAndTVMediaStatistics.emissionName}</span></div>
    <div class="field"><span class="label">RNombre d'auditeurs :</span> <span>${data.radioAndTVMediaStatistics.viewers}</span></div>
  </section>
        `
    }
    // Coverage of the media
    if (data.mediaTypes?.includes(MediaTypes.Print)) {
        html += `<!-- Couverture Print -->
  <section>
    <h2>Couverture médiatique print</h2>
    <div class="field"><span class="label">Nombre de pages :</span> <span>${data.mediaCoveragePrint.totalPages}</span></div>
    <div class="field"><span class="label">Longueur de l'article :</span> <span>${data.mediaCoveragePrint.articleLength}</span></div>
    <div class="field"><span class="label">Date de sortie de l'article :</span> <span>${data.mediaCoveragePrint.publishDate}</span></div>
  </section>
        `
    }
    if (data.mediaTypes?.includes(MediaTypes.Online)) {
        html += `<!-- Couverture Online -->
  <section>
    <h2>Couverture médiatique online (site web)</h2>
    <div class="field"><span class="label">Longueur de l'article :</span> <span>${data.mediaCoverageOnline.articleLength}</span></div>
    <div class="field"><span class="label">Thématique de l'article :</span> <span>${data.mediaCoverageOnline.articleThematic}</span></div>
    <div class="field"><span class="label">Date de sortie de l'article :</span> <span>${data.mediaCoverageOnline.publishDate}</span></div>
  </section>
        `
    }
    if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
        html += `<!-- Couverture TV/Radio -->
  <section>
    <h2>Couverture médiatique radio/TV</h2>
    <div class="field"><span class="label">Thématique de l'émission :</span> <span>${data.mediaCoverageTvOrRadio.articleThematic}</span></div>
    <div class="field"><span class="label">Date de sortie de l'article :</span> <span>${data.mediaCoverageTvOrRadio.publishDate}</span></div>
  </section>
        `
    }

    html += `<!-- Informations de voyage -->
  <section>
    <h2>Informations de voyage</h2>
    <div class="field"><span class="label">Départ :</span> <ul><li><span class="label">Ville :</span> <span>${data.travelInformation.departurePoint.city}</span></li><li><span class="label">Pays :</span> <span>${data.travelInformation.departurePoint.country}</span></li><li><span class="label">Trajet aller :</span> <span>${data.travelInformation.departurePoint.outwardJourney}</span></li></ul></div>
    <div class="field"><span class="label">Retour :</span> <span>${data.travelInformation.returnJourney}</span></div>
    <div class="field"><span class="label">Réduction sur les transports suisses :</span> <ul>${data.travelInformation.travelReductions?.map(x => `<li>${translations['fr'][`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${x}`]}</li>`).join("")}</ul></div>
    <div class="field"><span class="label">Dernière date de visite à Lausanne/en Suisse :</span> <span>${data.travelInformation.lastVisit}</span></div>
  </section>
`

    html += `<!-- Informations personnelles -->
  <section>
    <h2>Informations personnelles</h2>
    <div class="field"><span class="label">Titre :</span> <span>${translations['fr'][`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${data.personalInformation.title}`]}</span></div>
    <div class="field"><span class="label">Prénom :</span> <span>${data.personalInformation.firstName}</span></div>
    <div class="field"><span class="label">Nom :</span> <span>${data.personalInformation.lastName}</span></div>
    <div class="field"><span class="label">Date de naissance :</span> <span>${data.personalInformation.birthday}</span></div>
    <div class="field"><span class="label">Téléphone :</span> <span>${data.personalInformation.phoneNumber}</span></div>
    <div class="field"><span class="label">Email :</span> <span>${data.personalInformation.email}</span></div>
    <div class="field"><span class="label">Adresse :</span> <ul><li><span class="label">Adresse :</span> <span>${data.personalInformation.address.streetAddress}</span></li><li><span class="label">Ville :</span> <span>${data.personalInformation.address.city}</span></li><li><span class="label">ZIP :</span> <span>${data.personalInformation.address.postalcode}</span></li><li><span class="label">Pays :</span> <span>${data.personalInformation.address.country}</span></li></ul></div>
    <div class="field"><span class="label">Langues parlées :</span> <span>${data.personalInformation.spokenLanguages}</span></div>
    <div class="field"><span class="label">Freelance :</span> <span>${data.personalInformation.freelance ? 'oui' : 'non'}</span></div>

    <div class="field"><span class="label">Passport :</span> <ul><li><span class="label">Numéro :</span> <span>${data.personalInformation.passport.number}</span></li><li><span class="label">Validité :</span> <span>${data.personalInformation.passport.validity}</span></li></ul></div>
    <div class="field"><span class="label">Contacts d'urgence :</span> <ul>${data.personalInformation.emergencyContacts.map(x => `<li><span class="label">Nom :</span> <span>${x.name}</span></li><li><span class="label">Numéro de téléphone :</span> <span>${x.phoneNumber}</span></li>`)}</ul></div>
  </section>
`

    html += `<!-- Divers -->
  <section>
    <h2>Informations complémentaires</h2>
    <div class="field"><span class="label">Assurance de voyage couvrant la Suisse :</span> <span>${data.travelInsuranceCoveringSwitzerland ? 'oui' : 'non'}</span></div>
    <div class="field"><span class="label">Remarques :</span> <span>${data.remarks}</span></div>
    <div class="field"><span class="label">Newsletter :</span> <span>${data.newsletter ? 'oui' : 'non'}</span></div>
  </section>`

    return html;
}
