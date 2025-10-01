import { Forms, RouteTypes, SocialNetworks } from "$enums";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { sendEmail } from "$lib/helpers/mails.server";
import { supportedLocales, translations, type Locale } from "$lib/translations";
import type { MediaProfileContentCreatorFormData } from "$types/forms";
import { fail, redirect } from '@sveltejs/kit';
import type { Translations } from '@sveltekit-i18n/base';
import countries from 'i18n-iso-countries';
import de from "i18n-iso-countries/langs/de.json";
import en from "i18n-iso-countries/langs/en.json";
import fr from "i18n-iso-countries/langs/fr.json";
import { DateTime } from "luxon";
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from "./$types";
import { schemaStep4 } from "./schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  default: async ({ request, params, cookies }) => {
    const t = translations.get();
    const formdata = await request.formData();
    
    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, lastStep);

    if (!form.valid) {
      return fail(400, { form });
    }

    // required for mailchimp email body
    const images: Array<{
      type: string;
      name: string;
      content: string;
    }> = [];
    const instagramSubscriberStatisticsScreenshots: number[] = [];
    const instagramAccountsThatRespondedScreenshots: number[] = [];
    const tiktokSubscriberStatisticsScreenshots: number[] = [];
    const youtubeSubscriberStatisticsScreenshots: number[] = [];


    // Handle Instagram subscriber screenshots (can be single or multiple)
    const instagramSubscriber = formdata.getAll('instagramSubscriberScreenshots');
    for (const [i, file] of instagramSubscriber.entries()) {
      if (file instanceof File && file.size > 0) {

        instagramSubscriberStatisticsScreenshots.push(i);
        images.push({
          type: getMimeType(file.name),
          name: `${SocialNetworks.Instagram}_subscriber_${i}`, // Use CID as the name for inline images
          content: await fileToBase64(file)
        });
      }
    };

    // Handle Instagram accounts screenshots (can be single or multiple)
    const instagramAccounts = formdata.getAll('instagramAccountsScreenshots');
    for (const [i, file] of instagramAccounts.entries()) {
      if (file instanceof File && file.size > 0) {

        instagramAccountsThatRespondedScreenshots.push(i);
        images.push({
          type: getMimeType(file.name),
          name: `${SocialNetworks.Instagram}_account_${i}`, // Use CID as the name for inline images
          content: await fileToBase64(file)
        });
      }
    };

    // Handle TikTok subscriber screenshots
    const tiktokSubscriber = formdata.getAll('tiktokSubscriberScreenshots');
    for (const [i, file] of tiktokSubscriber.entries()) {
      if (file instanceof File && file.size > 0) {

        tiktokSubscriberStatisticsScreenshots.push(i);
        images.push({
          type: getMimeType(file.name),
          name: `${SocialNetworks.TikTok}_subscriber_${i}`, // Use CID as the name for inline images
          content: await fileToBase64(file)
        });
      }
    };

    // Handle YouTube subscriber screenshots
    const youtubeSubscriber = formdata.getAll('youtubeSubscriberScreenshots');
    for (const [i, file] of youtubeSubscriber.entries()) {
      if (file instanceof File && file.size > 0) {

        youtubeSubscriberStatisticsScreenshots.push(i);
        images.push({
          type: getMimeType(file.name),
          name: `${SocialNetworks.YouTube}_subscriber_${i}`, // Use CID as the name for inline images
          content: await fileToBase64(file)
        });
      }
    };


    // Continue with your email generation...
    const html = generateMailContent({
      data: form.data as MediaProfileContentCreatorFormData,
      userLocale: params.locale as Locale,
      translations: t,
      instagramSubscriberStatisticsScreenshots,
      instagramAccountsThatRespondedScreenshots,
      tiktokSubscriberStatisticsScreenshots,
      youtubeSubscriberStatisticsScreenshots,
    });

    const { internal_reponse } = await sendEmail({
      intern_mail: {
        from_name: "No Reply - Press",
        subject: "[Formulaire] - Createur de contenu",
        html,
        images,
      }
    });

    if (internal_reponse.every(x => x.status === 'sent')) {
      return redirect(303, `/${params.locale}/${t[params.locale][`route.${RouteTypes.Form}.slug`]}/${t[params.locale][`route.${RouteTypes.Form}.${Forms.Thanks}.slug`]}`);
    }

    setFlash({
      type: 'error',
      message: t[params.locale][`${RouteTypes.Form}.error-on-sending`] ?? ''
    }, cookies);

    return fail(500, { form, message: "Please retry later." });
  }
};

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

function getMimeType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
}

async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}

const generateMailContent = ({ data, userLocale, translations, instagramSubscriberStatisticsScreenshots,
  instagramAccountsThatRespondedScreenshots,
  tiktokSubscriberStatisticsScreenshots,
  youtubeSubscriberStatisticsScreenshots, }: {
    data: MediaProfileContentCreatorFormData, userLocale: Locale, translations: Translations.SerializedTranslations,
    instagramSubscriberStatisticsScreenshots: number[],
    instagramAccountsThatRespondedScreenshots: number[],
    tiktokSubscriberStatisticsScreenshots: number[],
    youtubeSubscriberStatisticsScreenshots: number[],
  }) => {
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
    html += `<!-- Statistiques Instagram -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.profile-url`]} :</span> <span>${data.instagramProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.subscriber-statistics-screenshots.title`]} :
      </span>
      ${instagramSubscriberStatisticsScreenshots
        .map((index) => {
          return `<img src="cid:${SocialNetworks.Instagram}_subscriber_${index}" style="max-width: 500px; display: block; margin: 10px 0;" />`
        })
        .join("\n") ?? ''}

    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.accounts-that-responded-screenshots.title`]} :
      </span>
      ${instagramAccountsThatRespondedScreenshots
        .map((index) => {
          return `<img src="cid:${SocialNetworks.Instagram}_account_${index}" style="max-width: 500px; display: block; margin: 10px 0;" />`
        })
        .join("\n") ?? ''}

    </div>
  </section>
`
  }
  if (data.onlinePresence?.includes(SocialNetworks.TikTok)) {
    html += `<!-- Statistiques Tiktok -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.profile-url`]} :</span> <span>${data.tiktokProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.subscriber-statistics-screenshots.title`]} :
      </span>
      ${tiktokSubscriberStatisticsScreenshots
        .map((index) => {
          return `<img src="cid:${SocialNetworks.TikTok}_subscriber_${index}" style="max-width: 500px; display: block; margin: 10px 0;" />`
        })
        .join("\n") ?? ''}

    </div>
  </section>
`
  }
  if (data.onlinePresence?.includes(SocialNetworks.YouTube)) {
    html += `<!-- Statistiques Youtube -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.profile-url`]} :</span> <span>${data.youtubeProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.subscriber-statistics-screenshots.title`]} :
      </span>
      ${youtubeSubscriberStatisticsScreenshots
        .map((index) => {
          return `<img src="cid:${SocialNetworks.YouTube}_subscriber_${index}" style="max-width: 500px; display: block; margin: 10px 0;" />`
        })
        .join("\n") ?? ''}

    </div>
  </section>
`
  }
  if (data.onlinePresence?.includes(SocialNetworks.Blog)) {
    html += `<!-- Statistiques Blog -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.url`]} :</span> <span>${data.blogURL ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.audience-profile.title`]} :</span> <span>${data.blogAudienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.performances.monthly-unique-visitors`]} :</span> <span>${data.blogMonthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.performances.montlhy-page-views`]} :</span> <span>${data.blogMonthlyPageViews ?? ''}</span></div>
  </section>
`
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.city`]} :</span> <span>${data.travelDepartureCity ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.country`]} :</span> <span>${data.travelDepartureCountry ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`]} :</span> <span>${data.travelOutwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.return-journey.title`]} :</span> <span>${data.travelReturnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`]} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelReductions?.map(x => `<li>${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${x}`]}</li>`).join("")}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.last-visit`]} :</span> <span>${data.travelLastVisit ? DateTime.fromSQL(data.travelLastVisit).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span></div>
  </section>
`

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.title`]}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.title`]} :</span> <span>${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.${data.personalTitle}`]}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.first-name`]} :</span> <span>${data.personalFirstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.last-name`]} :</span> <span>${data.personalLastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.birth-date`]} :</span> <span>${DateTime.fromSQL(data.personalBirthday!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.phone-number`]} :</span> <span>${data.personalPhoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.email`]} :</span> <span>${data.personalEmail ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.street-address`]} :</span> <span>${data.addressStreetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`]} :</span> <span>${data.addressCity}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.postal-code`]} :</span> <span>${data.addressPostalCode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`]} :</span> <span>${data.addressCountry}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`]} :</span> <span>${data.personalSpokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.freelance`]} :</span> <span>${data.personalFreelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.number`]} :</span> <span>${data.passportNumber}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.validity`]} :</span> <span>${data.passportValidity ? DateTime.fromSQL(data.passportValidity).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`]} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
      `;

  if (typeof data.emergencyContactNames === 'string') {
    html += `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`]} :</span> <span>${data.emergencyContactNames}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`]} :</span> <span>${data.emergencyContactPhones}</span>
          </li>
        `;
  } else {
    html += data.emergencyContactNames?.map((_, index) => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`]} :</span> <span>${data.emergencyContactNames[index]}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t[`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`]} :</span> <span>${data.emergencyContactPhones[index]}</span>
          </li>
        `).join("<li>----------------</li>") ?? '';
  }
  html += `
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
