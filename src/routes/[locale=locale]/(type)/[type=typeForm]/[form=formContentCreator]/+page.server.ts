import { Forms, MediaTypes, RouteTypes, SocialNetworks } from "$enums";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { supportedLocales, translations, type Locale } from "$lib/translations";
import type { MediaProfileContentCreator, MediaProfileJournalist } from "$types/forms";
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


    const html = generateMailContent({ data: form.data as MediaProfileContentCreator, userLocale: params.locale as Locale, translations: t })
    const { internal_reponse } = await sendEmail({
      intern_mail: {
        from_name: "No Reply - Press",
        subject: "[Formulaire] - Createur de contenu",
        html,
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


const generateMailContent = ({ data, userLocale, translations }: { data: MediaProfileContentCreator, userLocale: Locale, translations: Translations.SerializedTranslations }) => {
  const t = translations['fr'];


  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire créateur de contenu</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire Créateur de contenu</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${t[`lang.${userLocale}`]}</h2>

  <!-- Profil Média -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.social-media-information`]}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.content-positioning`]} :</span>
      &nbsp;
      <span>${data.contentPositioning ?? ''}</span>
    </div>
  </section>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.target-audience`]} :</span>
      &nbsp;
      <span>${data.targetAudience ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.title`]} :</span>
      &nbsp;
      <span>${data.onlinePresence?.map(x => t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${x}`]).join(', ') ?? ''}</span>
    </div>
  `;

  // statistics of the media
  if (data.onlinePresence?.includes(SocialNetworks.Instagram)) {
    html += `<!-- Statistiques Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.profile-url`]} :</span> <span>${data.statistics.instagram?.profileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.subscriber-statistics-screenshots`]} :
      </span>
      ${data
        .statistics
        .instagram
        ?.subscriberStatisticsScreenshots
        ?.map((file, index) => {
          return `<img src="cid:${SocialNetworks.Instagram}_subscriberStatisticsScreenshots_${index}`
        })
        ?.join("\n") ?? ''}

    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.accounts-that-responded-screenshots`]} :
      </span>
      ${data
        .statistics
        .instagram
        ?.accountsThatRespondedScreenshots
        ?.map((file, index) => {
          return `<img src="cid:${SocialNetworks.Instagram}_accountsThatRespondedScreenshots_${index}`
        })
        ?.join("\n") ?? ''}

    </div>
  </section>
`
  }


  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.`]}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.city`]} :</span> <span>${data.travelInformation?.departurePoint?.city ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.country`]} :</span> <span>${data.travelInformation?.departurePoint?.country ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`]} :</span> <span>${data.travelInformation?.departurePoint?.outwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.return-journey.title`]} :</span> <span>${data.travelInformation?.returnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`]} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelInformation?.travelReductions?.map(x => `<li>${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${x}`]}</li>`).join("")}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.last-visit`]} :</span> <span>${data.travelInformation?.lastVisit ? DateTime.fromSQL(data.travelInformation.lastVisit).toFormat('dd.MM.yyyy') : ''}</span></div>
  </section>
`

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.title`]} :</span> <span>${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.${data.personalInformation.title}`]}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.first-name`]} :</span> <span>${data.personalInformation?.firstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.last-name`]} :</span> <span>${data.personalInformation?.lastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.birth-date`]} :</span> <span>${DateTime.fromSQL(data.personalInformation.birthday!).toFormat('dd.MM.yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.phone-number`]} :</span> <span>${data.personalInformation?.phoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.email`]} :</span> <span>${data.personalInformation?.email ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.street-address`]} :</span> <span>${data.personalInformation.address.streetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`]} :</span> <span>${data.personalInformation.address.city}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.postal-code`]} :</span> <span>${data.personalInformation.address.postalcode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`]} :</span> <span>${data.personalInformation.address.country}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`]} :</span> <span>${data.personalInformation?.spokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.freelance`]} :</span> <span>${data.personalInformation.freelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.number`]} :</span> <span>${data.personalInformation?.passport?.number}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.validity`]} :</span> <span>${data.personalInformation?.passport?.validity ? DateTime.fromSQL(data.personalInformation.passport.validity).toFormat('dd.MM.yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        ${data.personalInformation?.emergencyContacts?.map(x => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`]} :</span> <span>${x.name}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`]} :</span> <span>${x.phoneNumber}</span>
          </li>
        `) ?? ''}
      </ul>
    </div>
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
