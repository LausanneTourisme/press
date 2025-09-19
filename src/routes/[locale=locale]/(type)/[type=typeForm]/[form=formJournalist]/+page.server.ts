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
        subject: "[Formulaire] - Journaliste",
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
      form: t[locale][`route.${RouteTypes.Form}.${Forms.Journalist}.slug`]
    };
  });
};


const generateMailContent = ({ data, userLocale, translations }: { data: MediaProfileJournalist, userLocale: Locale, translations: Translations.SerializedTranslations }) => {
  const t = translations['fr'];

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire journaliste</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire journaliste</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${t[`lang.${userLocale}`]}</h2>

  <!-- Médias -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Média</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.media-name`]} :</span> <span>${data.mediaName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic`]} :</span> <span>${data.thematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile`]} :</span> <span>${data.audienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.types`]} :</span> <span>${data.mediaTypes?.map(x => t[`${RouteTypes.Form}.${Forms.Journalist}.form.types.${x}`]).join(', ') ?? ''}</span></div>
  </section>
`
  // statistics of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Statistiques Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.broadcast-location`]} :</span> <span>${data.printMediaStatistics?.broadcastLocation ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.copies`]} :</span> <span>${data.printMediaStatistics?.copies ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.readers`]} :</span> <span>${data.printMediaStatistics?.readers ?? ''}</span></div>
  </section>
        `
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Statistiques Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.website`]} :</span> <span>${data.onlineMediaStatistics?.website ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.monthly-unique-visitors`]} :</span> <span>${data.onlineMediaStatistics?.monthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.monthly-page-views`]} :</span> <span>${data.onlineMediaStatistics?.montlhyPageViews ?? ''}</span></div>
  </section>
        `
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Statistiques TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.emission-name`]} :</span> <span>${data.radioAndTVMediaStatistics?.emissionName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.viewers`]} :</span> <span>${data.radioAndTVMediaStatistics?.viewers ?? ''}</span></div>
  </section>
        `
  }
  // Coverage of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Couverture Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.total-pages`]} :</span> <span>${data.mediaCoveragePrint.totalPages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.article-length`]} :</span> <span>${data.mediaCoveragePrint.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.publish-date`]} :</span> <span>${DateTime.fromSQL(data.mediaCoveragePrint.publishDate!).toFormat('dd.MM.yyyy')}</span></div>
  </section>
        `
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Couverture Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.article-length`]} :</span> <span>${data.mediaCoverageOnline?.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.article-thematic`]} :</span> <span>${data.mediaCoverageOnline?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.publish-date`]} :</span> <span>${DateTime.fromSQL(data.mediaCoverageOnline.publishDate!).toFormat('dd.MM.yyyy')}</span></div>
  </section>
        `
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Couverture TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.article-thematic`]} :</span> <span>${data.mediaCoverageTvOrRadio?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.publish-date`]} :</span> <span>${DateTime.fromSQL(data.mediaCoverageTvOrRadio.publishDate!).toFormat('dd.MM.yyyy')}</span></div>
  </section>
        `
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.`]}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city`]} :</span> <span>${data.travelInformation?.departurePoint?.city ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country`]} :</span> <span>${data.travelInformation?.departurePoint?.country ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.title`]} :</span> <span>${data.travelInformation?.departurePoint?.outwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.title`]} :</span> <span>${data.travelInformation?.returnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.title`]} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelInformation?.travelReductions?.map(x => `<li>${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${x}`]}</li>`).join("")}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.last-visit`]} :</span> <span>${data.travelInformation?.lastVisit ? DateTime.fromSQL(data.travelInformation.lastVisit).toFormat('dd.MM.yyyy') : ''}</span></div>
  </section>
`

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.title`]} :</span> <span>${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${data.personalInformation.title}`]}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name`]} :</span> <span>${data.personalInformation?.firstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name`]} :</span> <span>${data.personalInformation?.lastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.birth-date`]} :</span> <span>${DateTime.fromSQL(data.personalInformation.birthday!).toFormat('dd.MM.yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.phone-number`]} :</span> <span>${data.personalInformation?.phoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.email`]} :</span> <span>${data.personalInformation?.email ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.street-address`]} :</span> <span>${data.personalInformation.address.streetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`]} :</span> <span>${data.personalInformation.address.city}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.postal-code`]} :</span> <span>${data.personalInformation.address.postalcode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`]} :</span> <span>${data.personalInformation.address.country}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.title`]} :</span> <span>${data.personalInformation?.spokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.freelance`]} :</span> <span>${data.personalInformation.freelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.number`]} :</span> <span>${data.personalInformation?.passport?.number}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.validity`]} :</span> <span>${data.personalInformation?.passport?.validity ? DateTime.fromSQL(data.personalInformation.passport.validity).toFormat('dd.MM.yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        ${data.personalInformation?.emergencyContacts?.map(x => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`]} :</span> <span>${x.name}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`]} :</span> <span>${x.phoneNumber}</span>
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
