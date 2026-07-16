import { dev } from '$app/environment';
import { ConsentsTypes, Forms, RouteTypes, SocialNetworks, type SocialNetwork } from '$enums';
import { APSIS_CONTENT_CREATOR_FORM_EVENT_VERSION_ID } from '$env/static/private';
import { isOfflineMode } from '$lib/helpers';
import { selectCountryId, setConsents } from '$lib/helpers/apsis';
import { isCRMEnabled, verifyIfHuman } from '$lib/helpers/index.server';
import * as apsis from '$lib/services/apsis.server';
import { sendEmail } from '$lib/services/mails.server';
import { generatePdf } from '$lib/services/pdf.server';
import { supportedLocales, t, type Locale } from '$lib/translations';
import type { MailAttachment } from '$types/mail.types';
import { fail, redirect, type Cookies } from '@sveltejs/kit';
import countries from 'i18n-iso-countries';
import de from 'i18n-iso-countries/langs/de.json';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import { DateTime } from 'luxon';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { SuperValidated } from 'sveltekit-superforms/server';
import type { EntryGenerator } from './$types';
import { schemaStep4, type Schema } from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countriesByLocale: Record<string, any> = { en, fr, de };
const lastStep = zod4(schemaStep4);

type MailImage = {
  socialNetwork: SocialNetwork;
  category: 'subscriber' | 'account';
  type: string;
  name: string;
  content: string;
};

export const load = async ({ parent, setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=3600' });
  const [{ locale }, form] = await Promise.all([parent(), superValidate(lastStep)]);

  countries.registerLocale(countriesByLocale[locale]);

  return {
    countries: countries.getNames(locale, { select: 'official' }),
    form
  };
};

export const actions = {
  default: async ({ request, params, cookies, url }) => {
    const formdata = await request.formData();

    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, lastStep);

    if (!form.valid) {
      console.error('Form errors:', JSON.stringify(form.errors, null, 2));
      return failError({ form, cookies, message: `Form invalid` });
    }

    if (dev && isOfflineMode) {
      return redirect(
        303,
        `/${params.locale}/${t.get(`route.${RouteTypes.Forms}.slug`)}/${t.get(`route.${RouteTypes.Forms}.${Forms.Thanks}.slug`)}`
      );
    }

    if (isCRMEnabled && !(await apsis.createProfile(form.data.personalEmail))) {
      console.error(`Form can't create an Apsis profile`);
      return failError({ form, cookies, message: `Form can't create an Apsis profile` });
    }

    if (
      isCRMEnabled &&
      !(await updateApsisProfileSuccessfully({ data: form.data, locale: params.locale }))
    ) {
      return failError({ form, cookies, message: `Form can't update the Apsis profile` });
    }

    if (isCRMEnabled) {
      let message = '';
      const consentSucessFully = await setConsents({
        consents: form.data.newsletter
          ? [ConsentsTypes.MediaContentCreator, ConsentsTypes.NewsletterPress]
          : [ConsentsTypes.MediaContentCreator],
        email_to: form.data.personalEmail,
        onError: (error) => {
          message = error;
        }
      });

      if (!consentSucessFully) {
        return failError({ form, cookies, message });
      }

      if (
        !(await sendApsisCustomEvent({
          email: form.data.personalEmail,
          url_source: url.origin,
          data: form.data
        }))
      ) {
        return failError({ form, cookies, message: `Form can't send Apsis custom event` });
      }
    }

    if (dev) {
      console.log('sending form by email');
    }

    const sendWithSuccess = await sendFormByEmail({
      formdata,
      locale: params.locale as Locale,
      mediaProfileContentCreator: form.data
    });

    if (!sendWithSuccess) {
      failError({ code: 500, form, cookies });
    }

    return redirect(
      303,
      `/${params.locale}/${t.get(`route.${RouteTypes.Forms}.slug`)}/${t.get(`route.${RouteTypes.Forms}.${Forms.Thanks}.slug`)}`
    );
  }
};

export const entries: EntryGenerator = () => {
  return supportedLocales.flatMap((locale) => {
    return {
      locale,
      type: t.get(`route.${RouteTypes.Forms}.slug`),
      form: t.get(`route.${RouteTypes.Forms}.${Forms.ContentCreator}.slug`)
    };
  });
};

const failError = ({
  code,
  form,
  cookies,
  message,
  publicMessage
}: {
  form: SuperValidated<Schema>;
  cookies: Cookies;
  code?: number;
  message?: string;
  publicMessage?: string;
}) => {
  code = code ?? 400;
  console.error(message ?? `Form submission failed with code ${code}`);
  setFlash(
    {
      type: 'error',
      message: publicMessage ?? t.get(`${RouteTypes.Forms}.error-on-sending`)
    },
    cookies
  );
  // Strip File objects — not serializable by SvelteKit
  // Force valid: false so onUpdate doesn't set step = 0 and hide the form
  const serializableForm = {
    ...form,
    valid: false,
    data: {
      ...form.data,
      instagramSubscriberScreenshots: [],
      instagramAccountsScreenshots: [],
      tiktokSubscriberScreenshots: [],
      youtubeSubscriberScreenshots: []
    }
  };
  return fail(code, { form: serializableForm, message: message ?? 'Please retry later.' });
};

const updateApsisProfileSuccessfully = async ({
  data,
  locale
}: {
  data: Schema;
  locale: string;
}) => {
  const attributesUpdated = await apsis.updateProfileAttributes({
    email: data.personalEmail,
    attributes: {
      // PRESS - Type de formulaire
      'usercreated.attributes.press_-_type_de_formulaire-n3bz45db2a': `${t.get(`route.${RouteTypes.Forms}.slug`)} ${t.get(`route.${RouteTypes.Forms}.${Forms.ContentCreator}.slug`)}`,
      // PRESS - Positionnement du contenu
      'usercreated.attributes.press_-_positionnement_du_contenu-bdqpr9g311':
        data.contentPositioning ?? '',
      // PRESS - Profil de l'audience
      'usercreated.attributes.press_-_profil_de_laudience-434y7go1r9': data.targetAudience ?? '',
      // PRESS - Présence online
      'usercreated.attributes.press_-_prsence_online-moij88zwnl': data.onlinePresence.join(', '),
      // PRESS - Objet de la demande
      'usercreated.attributes.press_-_objet_de_la_demande-59ljafr7jf': data.objectRequest,
      // PRESS - Instagram URL
      'usercreated.attributes.press_-_instagram_url-8sus3gsfgr': data.instagramProfileURL ?? '',
      // PRESS - TikTok URL
      'usercreated.attributes.press_-_tiktok_url-pjut8gn2bh': data.tiktokProfileURL ?? '',
      // PRESS - YouTube URL
      'usercreated.attributes.press_-_youtube_url-wk57a2hfav': data.youtubeProfileURL ?? '',
      // PRESS - Blog - URL
      'usercreated.attributes.press_-_blog_-_url-sa7d43bb21': data.blogURL ?? '',
      // PRESS - Blog - profil de l'audience
      'usercreated.attributes.press_-_blog_-_profil_de_laudience-r18vll4wtk':
        data.blogAudienceProfile ?? '',
      // PRESS - Blog - Reach/Visiteurs uniques par mois
      'usercreated.attributes.press_-_blog_-_reachvisiteurs_uniques_par-87s4tfr5cw':
        data.blogMonthlyUniqueVisitors ?? 0,
      // PRESS - Blog - Nombre de pages vues par mois
      'usercreated.attributes.press_-_blog_-_nombre_de_pages_vues_par_m-qj3txcvmb5':
        data.blogMonthlyPageViews ?? 0,
      // PRESS - Information sur le résultat médiatique - Angle de la publication
      'usercreated.attributes.press_-_information_sur_le_rsultat_mdiati-rjo93mq5dp':
        data.coveragePublicationAngle ?? '',
      // PRESS - Information sur le résultat médiatique - Sujet(s) d'intérêts
      'usercreated.attributes.press_-_blog_-_reachvisiteurs_uniques_par-wk9wah8zkq':
        data.coverageSubjectsOfInterest ?? '',
      // PRESS - Information sur le résultat médiatique - Canaux de publication
      'usercreated.attributes.press_-_blog_-_nombre_de_pages_vues_par_m-qro3lxvhwp':
        data.coveragePublicationChannels?.join(', ') ?? '',
      // PRESS - Information sur le résultat médiatique - Couverture médiatique proposée
      'usercreated.attributes.press_-_information_sur_le_rsultat_mdiati-bn4glq9mgt':
        data.coverageProposedMediaCoverage ?? '',
      // PRESS - Information sur le résultat médiatique - Timing et dates des publications
      'usercreated.attributes.press_-_information_sur_le_rsultat_mdiati-mlohqqfnc6':
        data.coverageTimingAndPublicationDates ?? '',

      // PRESS - info voyage - pays départ
      'usercreated.attributes.press_-_info_voyage_-_pays_dpart-2qcy4rye1g': countries.getName(
        data.travelDepartureCountry,
        locale
      ),
      // PRESS - info voyage - trajet aller
      'usercreated.attributes.press_-_info_voyage_-_trajet_aller-2jsn1a11d1':
        data.travelOutwardJourney ?? '',
      // PRESS - info voyage - ville départ
      'usercreated.attributes.press_-_info_voyage_-_ville_dpart-9vum9j2my2':
        data.travelDepartureCity,
      // PRESS - info voyage - trajet retour
      'usercreated.attributes.press_-_info_voyage_-_trajet_retour-ow47wl9fsx':
        data.travelReturnJourney ?? '',
      // PRESS - info voyage - abonnements train
      'usercreated.attributes.press_-_info_voyage_-_abonnements_train-hil7po868z':
        data.travelReductions?.join(', ') ?? '',
      // PRESS - info voyage - dernière visite
      'usercreated.attributes.press_-_info_voyage_-_dernire_visite-vld8zpxgep':
        data.travelLastVisit ?? '',
      // PRESS - info personelles - Titre
      'usercreated.attributes.press_-_info_personelles_-_titre-wkn2jhthui': data.personalTitle,
      // PRESS - info personelles - Prénom
      'usercreated.attributes.press_-_info_personelles_-_prnom-mbqrq9wdyh': data.personalFirstName,
      // PRESS - info personelles - Nom
      'usercreated.attributes.press_-_info_personelles_-_nom-cxjbhy5hty': data.personalLastName,
      // PRESS - info personelles - date de naissance
      'usercreated.attributes.press_-_info_personelles_-_date_de_naissa-24imaurrq5':
        data.personalBirthday,
      // PRESS - info personelles - Numéro de Téléphone
      'usercreated.attributes.press_-_info_personelles_-_numro_de_tlpho-al4q3cx5jz':
        data.personalPhoneNumber,
      // PRESS - info personelles - email
      'usercreated.attributes.press_-_info_personelles_-_email-8b44zvzpt6': data.personalEmail,
      // PRESS - info personelles - langues parlées
      'usercreated.attributes.press_-_info_personelles_-_langues_parles-ttfydkakad':
        data.personalSpokenLanguages,
      // PRESS - info personelles - conditions médicales
      'usercreated.attributes.press_-_info_personelles_-_conditions_mdi-4djm12gpt1':
        data.personalMedicalCondition ?? '',
      // PRESS - info personelles - allergies
      'usercreated.attributes.press_-_info_personelles_-_allergies-8ja4yjsxx4':
        data.personalAllergies ?? '',
      // PRESS - info personelles - numéro de passport
      'usercreated.attributes.press_-_info_personelles_-_numro_de_passp-qzpnkyyl64':
        data.passportNumber ?? '',
      // PRESS - info personelles - validité du passport
      'usercreated.attributes.press_-_info_personelles_-_validit_du_pas-63lbaolk83':
        data.passportValidity ?? '',
      // PRESS - info personelles - Adresse
      'usercreated.attributes.press_-_info_personelles_-_adresse-4j5rjm99hd':
        data.addressStreetAddress,
      // PRESS - info personelles - Ville
      'usercreated.attributes.press_-_info_personelles_-_ville-xjpq3n6cbi': data.addressCity,
      // PRESS - info personelles - Zip
      'usercreated.attributes.press_-_info_personelles_-_zip-yefz81y17u': data.addressPostalCode,
      // PRESS - info personelles - Pays
      'usercreated.attributes.press_-_info_personelles_-_pays-tdg34z5ltt': data.addressCountry,
      // PRESS - info personelles - contacts d'urgence
      'usercreated.attributes.press_-_info_personelles_-_contacts_durge-l9fvrao7bi': (Array.isArray(
        data.emergencyContactNames
      )
        ? data.emergencyContactNames
        : [data.emergencyContactNames]
      )
        .map((name, i) => {
          const phones = Array.isArray(data.emergencyContactPhones)
            ? data.emergencyContactPhones
            : [data.emergencyContactPhones];
          return `${name} (${phones[i] ?? ''})`;
        })
        .join('; '),
      // PRESS - info personelles - assurance voyage
      'usercreated.attributes.press_-_info_personelles_-_assurance_voya-ctvpxedjyw':
        data.travelInsuranceCoveringSwitzerland,
      // PRESS - newsletter
      'usercreated.attributes.press_-_newsletter-omm8pihlcr': data.newsletter,
      // PRESS - info personelles - remarques
      'usercreated.attributes.press_-_info_personelles_-_remarques-5lrlrl21ta': data.remarks ?? '',

      // -------------------------------------- ATTRIBUTES FOR APSIS & CRM --------------------------------------

      // Birthdate (YYYY-MM-DD)
      'com.apsis1.attributes.birthdate': data.personalBirthday,
      // Profile First Name
      'com.apsis1.attributes.firstname': data.personalFirstName,
      // Last Name of profile
      'com.apsis1.attributes.lastname': data.personalLastName,
      // Primary mobile phone number
      'com.apsis1.attributes.mobile': Number(
        data.personalPhoneNumber.replaceAll('+', '00').replaceAll(' ', '')
      ),
      // Primary e-mail address
      'com.apsis1.attributes.email': data.personalEmail,
      // CRM - Field - Language
      'usercreated.attributes.langue_crm-98h3ud5p4v': (() => {
        switch (locale) {
          case 'fr':
            return 2;
          case 'de':
            return 4;
          case 'en':
          default:
            return 1;
        }
      })(),
      // CRM - Fields - Title
      'usercreated.attributes.crm_-_field_-_title-lzfs6a6wjk': (() => {
        switch (data.personalTitle) {
          case 'mr':
            return { fr: 'M.', en: 'Mr.', de: 'Herr' }[locale];
          case 'mrs':
            return { fr: 'Mme', en: 'Mrs.', de: 'Frau' }[locale];
          case 'they':
            return { fr: '-', en: '-', de: '-' }[locale];
        }
      })(),
      // CRM - Fields - Full Title
      'usercreated.attributes.crm_-_field_-_full_title-9ilaifqngn': (() => {
        switch (data.personalTitle) {
          case 'mr':
            return { fr: 'Monsieur', en: 'Mister', de: 'Herr' }[locale];
          case 'mrs':
            return { fr: 'Madame', en: 'Mistress', de: 'Frau' }[locale];
          case 'they':
            return { fr: '-', en: '-', de: '-' }[locale];
        }
      })(),
      // CRM - Fields - Account Manager
      'usercreated.attributes.crm_-_field_-_account_manager-wg3agn5erk': 213,
      // CRM - Fields - Type
      'usercreated.attributes.crm_-_fields_-_type-kg83vtqoiv': 1, // Média

      //// ADRESSE
      // CRM - Fields - Country
      'com.apsis1.integrations.efficy-enterprise-2.attributes.crm_-_pay-ukbzkdg2oh':
        selectCountryId(countries.getName(data.addressCountry, 'en')),
      // CRM - Fields - Post code
      'usercreated.attributes.crm_-_fields_-_post_code-sklez45cs6': data.addressPostalCode,
      // CRM - Fields - Street
      'usercreated.attributes.crm_-_fields_-_street-ym828bzua3': data.addressStreetAddress,
      // CRM - Fields - Town/City
      'usercreated.attributes.crm_-_fields_-_towncity-c3klcectbd': data.addressCity
    }
  });

  if (!attributesUpdated) {
    console.error(`Form can't update Apsis attributes`);
    return false;
  }
  return true;
};

const sendApsisCustomEvent = async ({
  email,
  url_source,
  data
}: {
  email: string;
  url_source: string;
  data: Schema;
}) => {
  return await apsis.customEvent({
    email,
    versionId: Number(APSIS_CONTENT_CREATOR_FORM_EVENT_VERSION_ID),
    attributes: {
      source: url_source,
      datetime: DateTime.now().toFormat('dd.MM.yyyy HH:mm'),
      positionnementDuContenu: data.contentPositioning,
      profilDeLAudience: data.targetAudience,
      presenceOnline: data.onlinePresence?.join(', ') ?? '',
      objetDeLaDemande: data.objectRequest ?? '',
      instagramURL: data.instagramProfileURL ?? '',
      tiktokURL: data.tiktokProfileURL ?? '',
      youtubeURL: data.youtubeProfileURL ?? '',
      blogURL: data.blogURL ?? '',
      blogProfilDeLAudience: data.blogAudienceProfile ?? '',
      blogReachVisiteursUniquesParMois: data.blogMonthlyUniqueVisitors ?? 0,
      blogNombreDePagesVuesParMois: data.blogMonthlyPageViews ?? 0,
      informationSurLeResultatMediatiqueAngleDeLaPublication: data.coveragePublicationAngle,
      informationSurLeResultatMediatiqueSujetsDInterets: data.coverageSubjectsOfInterest,
      informationSurLeResultatMediatiqueCanauxDePublication:
        data.coveragePublicationChannels?.join(', ') ?? '',
      informationSurLeResultatMediatiqueCouvertureMediatiqueProposee:
        data.coverageProposedMediaCoverage,
      informationSurLeResultatMediatiqueTimingEtDatesDesPublications:
        data.coverageTimingAndPublicationDates
    }
  });
};

function getMimeType(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml'
  };
  return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
}

async function fileToBase64(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString('base64');
}

const sendFormByEmail = async ({
  formdata,
  mediaProfileContentCreator,
  locale
}: {
  formdata: FormData;
  mediaProfileContentCreator: Schema;
  locale: Locale;
}) => {
  const images = await getImagesFromForm(formdata);
  const attachments: MailAttachment[] = [];
  const pdf = await generatePdf({
    html: generateMailContent({
      data: mediaProfileContentCreator,
      userLocale: locale,
      images,
      useImageB64: true,
      forPdf: true
    }),
    filename: '[Formulaire] - Createur de contenu.pdf'
  });

  const html = generateMailContent({
    data: mediaProfileContentCreator,
    userLocale: locale,
    images
  });

  if (pdf) {
    attachments.push(pdf);
  }

  return await sendEmail({
    intern_mail: {
      from_name: 'No Reply - Press',
      subject: '[Formulaire] - Createur de contenu',
      html,
      images,
      attachments
    },
    external_mail: mediaProfileContentCreator.personalEmail
      ? {
          from_name: t.get(`${RouteTypes.Forms}.email.from-name`),
          subject: t.get(`${RouteTypes.Forms}.email.subject`, {
            form: t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.title`)
          }),
          html: `<p>${t.get(`${RouteTypes.Forms}.email.content`, { name: `${mediaProfileContentCreator.personalFirstName} ${mediaProfileContentCreator.personalLastName}` })}</p><p><i>${t.get(`${RouteTypes.Forms}.email.automatic-mail-disclaimer`)}</i></p>`,
          to: [
            {
              email: mediaProfileContentCreator.personalEmail
            }
          ]
        }
      : undefined
  });
};

const getImagesFromForm = async (formdata: FormData) => {
  // required for mailchimp email body
  const images: MailImage[] = [];

  // Handle Instagram subscriber screenshots (can be single or multiple)
  for (const [i, file] of formdata.getAll('instagramSubscriberScreenshots').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        socialNetwork: SocialNetworks.Instagram,
        category: 'subscriber',
        type: getMimeType(file.name),
        name: `${SocialNetworks.Instagram}_subscriber_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  // Handle Instagram accounts screenshots (can be single or multiple)
  for (const [i, file] of formdata.getAll('instagramAccountsScreenshots').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        socialNetwork: SocialNetworks.Instagram,
        category: 'account',
        type: getMimeType(file.name),
        name: `${SocialNetworks.Instagram}_account_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  // Handle TikTok subscriber screenshots
  for (const [i, file] of formdata.getAll('tiktokSubscriberScreenshots').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        socialNetwork: SocialNetworks.TikTok,
        category: 'subscriber',
        type: getMimeType(file.name),
        name: `${SocialNetworks.TikTok}_subscriber_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  // Handle YouTube subscriber screenshots
  for (const [i, file] of formdata.getAll('youtubeSubscriberScreenshots').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        socialNetwork: SocialNetworks.YouTube,
        category: 'subscriber',
        type: getMimeType(file.name),
        name: `${SocialNetworks.YouTube}_subscriber_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  return images;
};

const generateMailContent = ({
  data,
  userLocale,
  images,
  useImageB64,
  forPdf
}: {
  data: Schema;
  userLocale: Locale;
  images: MailImage[];
  useImageB64?: boolean;
  forPdf?: boolean;
}) => {
  // convert undefine to false and keep bool with right value
  // eslint-disable-next-line no-extra-boolean-cast
  const isMailchimpEmail = !!!useImageB64; // default value false
  // Email shows the country in the applicant's language; the PDF always in French
  const countryLocale: Locale = forPdf ? 'fr' : userLocale;
  if (forPdf) countries.registerLocale(fr);

  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire créateur de contenu</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire Créateur de contenu</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${t.get(`lang.${userLocale}`)}</h2>

  <!-- Profil Média -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.social-media-information`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.content-positioning`)} :</span>
      &nbsp;
      <span style="word-break: break-all;">${data.contentPositioning ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.target-audience`)} :</span>
      &nbsp;
      <span style="word-break: break-all;">${data.targetAudience ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.online-presence.title`)} :</span>
      &nbsp;
      <span>${data.onlinePresence?.map((x) => t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.online-presence.${x}`)).join(', ') ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.object-request`)} :</span>
      &nbsp;
      <span style="word-break: break-all;">${data.objectRequest ?? ''}</span>
    </div>
  </section>
  `;

  // statistics of the media
  if (data.onlinePresence?.includes(SocialNetworks.Instagram)) {
    html += `<!-- Statistiques Instagram -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.instagram.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.instagram.profile-url`)} :</span> <span>${data.instagramProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.instagram.subscriber-statistics-screenshots.title`)} :
      </span>
      ${
        images
          .filter(
            (i) => i.socialNetwork === SocialNetworks.Instagram && i.category === 'subscriber'
          )
          .map((image) => {
            if (isMailchimpEmail) {
              return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
            }
            return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
          })
          .join('\n') ?? ''
      }

    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.instagram.accounts-that-responded-screenshots.title`)} :
      </span>
      ${
        images
          .filter((i) => i.socialNetwork === SocialNetworks.Instagram && i.category === 'account')
          .map((image) => {
            if (isMailchimpEmail) {
              return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
            }
            return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
          })
          .join('\n') ?? ''
      }

    </div>
  </section>
`;
  }
  if (data.onlinePresence?.includes(SocialNetworks.TikTok)) {
    html += `<!-- Statistiques Tiktok -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.tiktok.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.tiktok.profile-url`)} :</span> <span>${data.tiktokProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.tiktok.subscriber-statistics-screenshots.title`)} :
      </span>
      ${
        images
          .filter((i) => i.socialNetwork === SocialNetworks.TikTok && i.category === 'subscriber')
          .map((image) => {
            if (isMailchimpEmail) {
              return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
            }
            return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
          })
          .join('\n') ?? ''
      }

    </div>
  </section>
`;
  }
  if (data.onlinePresence?.includes(SocialNetworks.YouTube)) {
    html += `<!-- Statistiques Youtube -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.youtube.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.youtube.profile-url`)} :</span> <span>${data.youtubeProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.youtube.subscriber-statistics-screenshots.title`)} :
      </span>
      ${
        images
          .filter((i) => i.socialNetwork === SocialNetworks.YouTube && i.category === 'subscriber')
          .map((image) => {
            if (isMailchimpEmail) {
              return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
            }
            return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
          })
          .join('\n') ?? ''
      }

    </div>
  </section>
`;
  }
  if (data.onlinePresence?.includes(SocialNetworks.Blog)) {
    html += `<!-- Statistiques Blog -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.blog.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.blog.url`)} :</span> <span>${data.blogURL ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.blog.audience-profile.title`)} :</span> <span>${data.blogAudienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.blog.performance.monthly-unique-visitors`)} :</span> <span>${data.blogMonthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.statistics.blog.performance.monthly-page-views`)} :</span> <span>${data.blogMonthlyPageViews ?? ''}</span></div>
  </section>
`;
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.city`)} :</span> <span>${data.travelDepartureCity ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.country`)} :</span> <span>${countries.getName(data.travelDepartureCountry, countryLocale) ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`)} :</span> <span>${data.travelOutwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.return-journey.title`)} :</span> <span>${data.travelReturnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`)} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelReductions?.map((x) => `<li>${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${x}`)}</li>`).join('')}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.travel-information.last-visit`)} :</span> <span>${data.travelLastVisit ? DateTime.fromSQL(data.travelLastVisit).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span></div>
  </section>
`;

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.titles.title`)} :</span> <span style="word-break: break-all;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.titles.${data.personalTitle}`)}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.first-name`)} :</span> <span style="word-break: break-all;">${data.personalFirstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.last-name`)} :</span> <span style="word-break: break-all;">${data.personalLastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.birth-date`)} :</span> <span>${DateTime.fromSQL(data.personalBirthday!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.phone-number`)} :</span> <span style="word-break: break-all;">${data.personalPhoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.email`)} :</span> <span style="word-break: break-all;">${data.personalEmail ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.street-address`)} :</span> <span style="word-break: break-all;">${data.addressStreetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.city`)} :</span> <span style="word-break: break-all;">${data.addressCity}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.postal-code`)} :</span> <span style="word-break: break-all;">${data.addressPostalCode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.address.country`)} :</span> <span style="word-break: break-all;">${countries.getName(data.addressCountry, countryLocale) ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`)} :</span> <span style="word-break: break-all;">${data.personalSpokenLanguages ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.number`)} :</span> <span style="word-break: break-all;">${data.passportNumber}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.passport.validity`)} :</span> <span style="word-break: break-all;">${data.passportValidity ? DateTime.fromSQL(data.passportValidity).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
      `;

  if (typeof data.emergencyContactNames === 'string') {
    html += `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`)} :</span> <span style="word-break: break-all;">${data.emergencyContactNames}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span style="word-break: break-all;">${data.emergencyContactPhones}</span>
          </li>
        `;
  } else {
    html +=
      data.emergencyContactNames
        ?.map(
          (_, index) => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`)} :</span> <span style="word-break: break-all;">${data.emergencyContactNames[index]}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span style="word-break: break-all;">${data.emergencyContactPhones[index]}</span>
          </li>
        `
        )
        .join(
          '<li><div style="border: 1px solid #ddd; border-radius: 8px; width: 50%; margin-top: 5px; margin-bottom: 5px;"/></li>'
        ) ?? '';
  }
  html += `
      </ul>
    </div>
  </section>
`;

  html += `<!-- Divers -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">Informations complémentaires</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Assurance de voyage couvrant la Suisse :</span> <span>${data.travelInsuranceCoveringSwitzerland ? 'Oui' : 'Non'}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">A lu les termes d'acceptation :</span> <span>${data.readTermsOfAcceptance ? 'Oui' : 'Non'}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Remarques :</span> <span style="word-break: break-all;">${data.remarks ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Newsletter :</span> <span>${data.newsletter ? 'Oui' : 'Non'}</span></div>
  </section>
</body>
</html>
  `;

  return html;
};
