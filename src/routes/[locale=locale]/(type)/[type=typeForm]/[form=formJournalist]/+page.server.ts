import { dev } from '$app/environment';
import { ConsentsTypes, Forms, MediaTypes, RouteTypes } from '$enums';
import { env } from '$env/dynamic/private';
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
      return failError({ form, cookies, message: `Form invalid` });
    }

    if (dev && isOfflineMode) {
      return redirect(
        303,
        `/${params.locale}/${t.get(`route.${RouteTypes.Forms}.slug`)}/${t.get(`route.${RouteTypes.Forms}.${Forms.Thanks}.slug`)}`
      );
    }

    if (isCRMEnabled && !(await apsis.createProfile(form.data.personalInformation.email))) {
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
          ? [ConsentsTypes.MeidaPress, ConsentsTypes.NewsletterPress]
          : [ConsentsTypes.MeidaPress],
        email_to: form.data.personalInformation.email,
        onError: (error) => {
          message = error;
        }
      });

      if (!consentSucessFully) {
        return failError({
          form,
          cookies,
          message
        });
      }

      if (
        !(await sendApsisCustomEvent({
          email: form.data.personalInformation.email,
          url_source: url.origin,
          data: form.data,
          locale: params.locale
        }))
      ) {
        return failError({
          form,
          cookies,
          message: `Form can't send Apsis custom event`
        });
      }
    }
    if (dev) {
      console.log('sending form by email');
    }

    const sendWithSuccess = await sendFormByEmail({
      locale: params.locale as Locale,
      mediaProfileJournalist: form.data
    });

    if (sendWithSuccess) {
      return redirect(
        303,
        `/${params.locale}/${t.get(`route.${RouteTypes.Forms}.slug`)}/${t.get(`route.${RouteTypes.Forms}.${Forms.Thanks}.slug`)}`
      );
    }

    failError({ code: 500, form, cookies });
  }
};

export const entries: EntryGenerator = () => {
  return supportedLocales.flatMap((locale) => {
    return {
      locale,
      type: t.get(`route.${RouteTypes.Forms}.slug`),
      form: t.get(`route.${RouteTypes.Forms}.${Forms.Journalist}.slug`)
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
  return fail(code, { form, message: message ?? 'Please retry later.' });
};

const updateApsisProfileSuccessfully = async ({
  data,
  locale
}: {
  data: Schema;
  locale: Locale;
}) => {
  const attributesUpdated = await apsis.updateProfileAttributes({
    email: data.personalInformation.email,
    attributes: {
      // PRESS - Type de formulaire
      'usercreated.attributes.press_-_type_de_formulaire-n3bz45db2a': `${t.get(`route.${RouteTypes.Forms}.slug`)} ${t.get(`route.${RouteTypes.Forms}.${Forms.Journalist}.slug`)}`,
      // PRESS - Nom média
      'usercreated.attributes.press_-_nom_mdia-mnikzmwwgw': data.mediaName,
      // PRESS - Thématique du média
      'usercreated.attributes.press_-_thmatique_du_mdia-dpju2awz9f': data.thematic,
      // PRESS - Profil de l'audience
      'usercreated.attributes.press_-_profil_de_laudience-434y7go1r9': data.audienceProfile,
      // PRESS - Type de médias
      'usercreated.attributes.press_-_type_de_mdias-8iz76e7cqf': data.mediaTypes.join(', '),
      // PRESS - Objet de la demande
      'usercreated.attributes.press_-_objet_de_la_demande-59ljafr7jf': data.objectRequest,
      // PRESS - stats print - lieux de diffusion
      'usercreated.attributes.press_-_stats_print_-_lieux_de_diffusion-sny3omfvn4':
        data.printMediaStatistics?.broadcastLocation,
      // PRESS - stats print - nombre d'exemplaires
      'usercreated.attributes.press_-_stats_print_-_nombre_dexemplaires-gv56zq433f':
        data.printMediaStatistics?.copies,
      // PRESS - stats print - nombre de lecteurs
      'usercreated.attributes.press_-_stats_print_-_nombre_de_lecteurs-1c7lottbnm':
        data.printMediaStatistics?.readers,
      // PRESS - stats radio/tv - Nom de l'émission
      'usercreated.attributes.press_-_stats_radiotv_-_nom_de_lmission-pkli1azlc8':
        data.radioAndTVMediaStatistics?.emissionName,
      // PRESS - stats radio/tv - nombre d'auditeurs
      'usercreated.attributes.press_-_stats_radiotv_-_nombre_dauditeurs-yglhf6972f':
        data.radioAndTVMediaStatistics?.viewers,
      // PRESS - stats site web - nombre de pages vues par mois
      'usercreated.attributes.press_-_stats_site_web_-_nombre_de_pages_-78nx897yjd':
        data.onlineMediaStatistics?.monthlyPageViews ?? undefined,
      // PRESS - stats site web - url
      'usercreated.attributes.press_-_stats_site_web_-_url-fpko4in3um':
        data.onlineMediaStatistics?.website,
      // PRESS - stats site web - visiteurs uniques par mois
      'usercreated.attributes.press_-_stats_site_web_-_visiteurs_unique-aodjvepkyu':
        data.onlineMediaStatistics?.monthlyUniqueVisitors,
      // PRESS - couverture médiatique radio/tv - thématique de l'émission
      'usercreated.attributes.press_-_couverture_mdiatique_radiotv_-_th-vk4cdag1hu':
        data.mediaCoverageTvOrRadio?.articleThematic,
      // PRESS - couverture médiatique radio/tv - date de sortie de l'émission
      'usercreated.attributes.press_-_couverture_mdiatique_radiotv_-_da-k4z98wlusn':
        data.mediaCoverageTvOrRadio?.publishDate,
      // PRESS - couverture médiatique print - nombre de pages
      'usercreated.attributes.press_-_couverture_mdiatique_print_-_nomb-xxx6c33coz':
        data.mediaCoveragePrint?.totalPages,
      // PRESS - couverture médiatique print - Longueur de l'article
      'usercreated.attributes.press_-_couverture_mdiatique_print_-_long-2wgqzpcyws':
        data.mediaCoveragePrint?.articleLength,
      // PRESS - couverture médiatique print - date de sortie de l'article
      'usercreated.attributes.press_-_couverture_mdiatique_print_-_date-knfrd93d8l':
        data.mediaCoveragePrint?.publishDate,
      // PRESS - couverture médiatique site web - thématique de l'article
      'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_t-2u34gt8m9i':
        data.mediaCoverageOnline?.articleThematic,
      // PRESS - couverture médiatique site web - date de sortie de l'article
      'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_d-51ziynjuvl':
        data.mediaCoverageOnline?.publishDate,
      // PRESS - couverture médiatique site web - longueur de l'article
      'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_l-nhda9bgdj3':
        data.mediaCoverageOnline?.articleLength,
      // PRESS - info voyage - pays départ
      'usercreated.attributes.press_-_info_voyage_-_pays_dpart-2qcy4rye1g': countries.getName(
        data.travelInformation.departurePoint.country,
        locale
      ),
      // PRESS - info voyage - trajet aller
      'usercreated.attributes.press_-_info_voyage_-_trajet_aller-2jsn1a11d1':
        data.travelInformation.departurePoint.outwardJourney ?? '',
      // PRESS - info voyage - ville départ
      'usercreated.attributes.press_-_info_voyage_-_ville_dpart-9vum9j2my2':
        data.travelInformation.departurePoint.city,
      // PRESS - info voyage - trajet retour
      'usercreated.attributes.press_-_info_voyage_-_trajet_retour-ow47wl9fsx':
        data.travelInformation.returnJourney ?? '',
      // PRESS - info voyage - abonnements train
      'usercreated.attributes.press_-_info_voyage_-_abonnements_train-hil7po868z':
        data.travelInformation.travelReductions.join(', '),
      // PRESS - info voyage - dernière visite
      'usercreated.attributes.press_-_info_voyage_-_dernire_visite-vld8zpxgep':
        data.travelInformation.lastVisit ?? '',
      // PRESS - info personelles - Titre
      'usercreated.attributes.press_-_info_personelles_-_titre-wkn2jhthui':
        data.personalInformation.title,
      // PRESS - info personelles - Prénom
      'usercreated.attributes.press_-_info_personelles_-_prnom-mbqrq9wdyh':
        data.personalInformation.firstName,
      // PRESS - info personelles - Nom
      'usercreated.attributes.press_-_info_personelles_-_nom-cxjbhy5hty':
        data.personalInformation.lastName,
      // PRESS - info personelles - date de naissance
      'usercreated.attributes.press_-_info_personelles_-_date_de_naissa-24imaurrq5':
        data.personalInformation.birthday,
      // PRESS - info personelles - Numéro de Téléphone
      'usercreated.attributes.press_-_info_personelles_-_numro_de_tlpho-al4q3cx5jz':
        data.personalInformation.phoneNumber,
      // PRESS - info personelles - email
      'usercreated.attributes.press_-_info_personelles_-_email-8b44zvzpt6':
        data.personalInformation.email,
      // PRESS - info personelles - langues parlées
      'usercreated.attributes.press_-_info_personelles_-_langues_parles-ttfydkakad':
        data.personalInformation.spokenLanguages,
      // PRESS - info personelles - conditions médicales
      'usercreated.attributes.press_-_info_personelles_-_conditions_mdi-4djm12gpt1':
        data.personalInformation.medicalAndPhysicalCondition ?? '',
      // PRESS - info personelles - allergies
      'usercreated.attributes.press_-_info_personelles_-_allergies-8ja4yjsxx4':
        data.personalInformation.allergies,
      // PRESS - info personelles - freelance
      'usercreated.attributes.press_-_info_personelles_-_freelance-obp6v6zi8j':
        data.personalInformation.freelance,
      // PRESS - info personelles - numéro de passport
      'usercreated.attributes.press_-_info_personelles_-_numro_de_passp-qzpnkyyl64':
        data.personalInformation.passport.number,
      // PRESS - info personelles - validité du passport
      'usercreated.attributes.press_-_info_personelles_-_validit_du_pas-63lbaolk83':
        data.personalInformation.passport.validity,
      // PRESS - info personelles - Adresse
      'usercreated.attributes.press_-_info_personelles_-_adresse-4j5rjm99hd':
        data.personalInformation.address.streetAddress,
      // PRESS - info personelles - Ville
      'usercreated.attributes.press_-_info_personelles_-_ville-xjpq3n6cbi':
        data.personalInformation.address.city,
      // PRESS - info personelles - Zip
      'usercreated.attributes.press_-_info_personelles_-_zip-yefz81y17u':
        data.personalInformation.address.postalcode,
      // PRESS - info personelles - Pays
      'usercreated.attributes.press_-_info_personelles_-_pays-tdg34z5ltt': countries.getName(
        data.personalInformation.address.country,
        locale
      ),
      // PRESS - info personelles - contacts d'urgence
      'usercreated.attributes.press_-_info_personelles_-_contacts_durge-l9fvrao7bi':
        data.personalInformation.emergencyContacts
          .map((X) => `${X.name} (${X.phoneNumber})`)
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
      'com.apsis1.attributes.birthdate': data.personalInformation.birthday,
      // Profile First Name
      'com.apsis1.attributes.firstname': data.personalInformation.firstName,
      // Last Name of profile
      'com.apsis1.attributes.lastname': data.personalInformation.lastName,
      // Primary mobile phone number
      'com.apsis1.attributes.mobile': Number(
        data.personalInformation.phoneNumber.replaceAll('+', '00').replaceAll(' ', '')
      ),
      // Primary e-mail address
      'com.apsis1.attributes.email': data.personalInformation.email,
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
        switch (data.personalInformation.title) {
          case 'mr':
            return {
              fr: 'M.',
              en: 'Mr.',
              de: 'Herr'
            }[locale];
          case 'mrs':
            return {
              fr: 'Mme',
              en: 'Mrs.',
              de: 'Frau'
            }[locale];
          case 'they':
            return {
              fr: '-',
              en: '-',
              de: '-'
            }[locale];
        }
      })(),
      // CRM - Fields - Full Title
      'usercreated.attributes.crm_-_field_-_full_title-9ilaifqngn': (() => {
        switch (data.personalInformation.title) {
          case 'mr':
            return {
              fr: 'Monsieur',
              en: 'Mister',
              de: 'Herr'
            }[locale];
          case 'mrs':
            return {
              fr: 'Madame',
              en: 'Mistress',
              de: 'Frau'
            }[locale];
          case 'they':
            return {
              fr: '-',
              en: '-',
              de: '-'
            }[locale];
        }
      })(),
      // CRM - Fields - Account Manager
      'usercreated.attributes.crm_-_field_-_account_manager-wg3agn5erk': 213,
      // CRM - Fields - Media Sub-Type
      'usercreated.attributes.crm_-_field_-_media_sub-type-1htwf2zbbw': data.personalInformation
        .freelance
        ? 2
        : 1,
      // CRM - Fields - Type
      'usercreated.attributes.crm_-_fields_-_type-kg83vtqoiv': 1, // Média

      //// ADRESSE
      // CRM - Fields - Country
      'com.apsis1.integrations.efficy-enterprise-2.attributes.crm_-_pay-ukbzkdg2oh':
        selectCountryId(countries.getName(data.personalInformation.address.country, 'en')),
      // CRM - Fields - Post code
      'usercreated.attributes.crm_-_fields_-_post_code-sklez45cs6':
        data.personalInformation.address.postalcode,
      // CRM - Fields - Street
      'usercreated.attributes.crm_-_fields_-_street-ym828bzua3':
        data.personalInformation.address.streetAddress,
      // CRM - Fields - Town/City
      'usercreated.attributes.crm_-_fields_-_towncity-c3klcectbd':
        data.personalInformation.address.city
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
  data,
  locale
}: {
  email: string;
  url_source: string;
  data: Schema;
  locale: Locale;
}) => {
  return await apsis.customEvent({
    email,
    versionId: Number(env.APSIS_JOURNALIST_FORM_EVENT_VERSION_ID),
    attributes: {
      source: url_source,
      datetime: DateTime.now().toFormat('dd.MM.yyyy HH:mm'),
      nomMedia: data.mediaName,
      thematiqueDuMedia: data.thematic,
      profilDeLAudience: data.audienceProfile,
      typeDeMedias: data.mediaTypes.join(', '),
      objetDeLaDemande: data.objectRequest,
      statsPrintLieuxDeDiffusion: data.printMediaStatistics?.broadcastLocation ?? '',
      statsPrintNombreDExemplaires: Number(data.printMediaStatistics?.copies ?? 0),
      statsPrintNombreDeLecteurs: Number(data.printMediaStatistics?.readers ?? 0),
      statsRadioTvNomDeLEmission: data.radioAndTVMediaStatistics?.emissionName ?? '',
      statsRadioTvNombreDAuditeurs: Number(data.radioAndTVMediaStatistics?.viewers ?? 0),
      statsSiteWebNombreDePagesVuesParMois: Number(
        data.onlineMediaStatistics?.monthlyPageViews ?? 0
      ),
      statsSiteWebUrl: data.onlineMediaStatistics?.website ?? '',
      statsSiteWebVisiteursUniquesParMois: Number(
        data.onlineMediaStatistics?.monthlyUniqueVisitors ?? 0
      ),
      couvertureMediatiqueRadioTvThematiqueDeLEmission:
        data.mediaCoverageTvOrRadio?.articleThematic ?? '',
      couvertureMediatiqueRadioTvDateDeSortieDeLEmission:
        data.mediaCoverageTvOrRadio?.publishDate ?? '',
      couvertureMediatiquePrintNombreDePages: Number(data.mediaCoveragePrint?.totalPages ?? 0),
      couvertureMediatiquePrintLongueurDeLArticle: data.mediaCoveragePrint?.articleLength ?? '',
      couvertureMediatiquePrintDateDeSortieDeLArticle: data.mediaCoveragePrint?.publishDate ?? '',
      couvertureMediatiqueSiteWebThematiqueDeLArticle:
        data.mediaCoverageOnline?.articleThematic ?? '',
      couvertureMediatiqueSiteWebDateDeSortieDeLArticle:
        data.mediaCoverageOnline?.publishDate ?? '',
      couvertureMediatiqueSiteWebLongueurDeLArticle: data.mediaCoverageOnline?.articleLength ?? '',
      infoVoyagePaysDepart:
        countries.getName(data.travelInformation.departurePoint.country, locale) ?? '',
      infoVoyageTrajetAller: data.travelInformation.departurePoint.outwardJourney ?? '',
      infoVoyageVilleDepart: data.travelInformation.departurePoint.city,
      infoVoyageTrajetRetour: data.travelInformation.returnJourney ?? '',
      infoVoyageAbonnementsTrain: data.travelInformation.travelReductions.join(', '),
      infoVoyageDerniereVisite: data.travelInformation.lastVisit ?? '',
      infoPersonellesLanguesParlees: data.personalInformation.spokenLanguages,
      newsletter: data.newsletter,
      freelance: data.personalInformation.freelance
    }
  });
};

const sendFormByEmail = async ({
  mediaProfileJournalist,
  locale
}: {
  mediaProfileJournalist: Schema;
  locale: Locale;
}) => {
  const attachments: MailAttachment[] = [];
  const html = generateMailContent({ data: mediaProfileJournalist, userLocale: locale });

  const pdfHtml = generateMailContent({
    data: mediaProfileJournalist,
    userLocale: locale,
    forPdf: true
  });

  const pdf = await generatePdf({ html: pdfHtml, filename: '[Formulaire] - Journaliste.pdf' });

  if (pdf) {
    attachments.push(pdf);
  }

  return await sendEmail({
    intern_mail: {
      from_name: 'No Reply - Press',
      subject: '[Formulaire] - Journaliste',
      html,
      attachments
    },
    external_mail: mediaProfileJournalist.personalInformation?.email
      ? {
          from_email: env.MAIL_FROM,
          from_name: t.get(`${RouteTypes.Forms}.email.from-name`),
          subject: t.get(`${RouteTypes.Forms}.email.subject`, {
            form: t.get(`${RouteTypes.Forms}.${Forms.Journalist}.title`)
          }),
          html: `<p>${t.get(`${RouteTypes.Forms}.email.content`, { name: `${mediaProfileJournalist.personalInformation.firstName} ${mediaProfileJournalist.personalInformation.lastName}` })}</p><p><i>${t.get(`${RouteTypes.Forms}.email.automatic-mail-disclaimer`)}</i></p>`,
          to: [
            {
              email: mediaProfileJournalist.personalInformation.email
            }
          ]
        }
      : undefined
  });
};

const generateMailContent = ({
  data,
  userLocale,
  forPdf
}: {
  data: Schema;
  userLocale: Locale;
  forPdf?: boolean;
}) => {
  // Email shows the country in the applicant's language; the PDF always in French
  const countryLocale: Locale = forPdf ? 'fr' : userLocale;
  if (forPdf) countries.registerLocale(fr);
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire journaliste</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire journaliste</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${t.get(`lang.${userLocale}`)}</h2>

  <!-- Médias -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Média</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.media-name`)} :</span> <span style="word-break: break-all;">${data.mediaName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.media-thematic`)} :</span> <span style="word-break: break-all;">${data.thematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.audience-profile`)} :</span> <span style="word-break: break-all;">${data.audienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.types.title`)} :</span> <span>${data.mediaTypes?.map((x) => t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.types.${x}`)).join(', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.object-request`)} :</span> <span style="word-break: break-all;">${data.objectRequest ?? ''}</span></div>
  </section>
`;
  // statistics of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Statistiques Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.print.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.print.broadcast-location`)} :</span> <span style="word-break: break-all;">${data.printMediaStatistics?.broadcastLocation ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.print.copies`)} :</span> <span>${data.printMediaStatistics?.copies ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.print.readers`)} :</span> <span>${data.printMediaStatistics?.readers ?? ''}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Statistiques Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.online.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.online.website`)} :</span> <span style="word-break: break-all;">${data.onlineMediaStatistics?.website ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.online.monthly-unique-visitors`)} :</span> <span>${data.onlineMediaStatistics?.monthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.online.monthly-page-views`)} :</span> <span>${data.onlineMediaStatistics?.monthlyPageViews ?? ''}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Statistiques TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.radio-and-tv.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.radio-and-tv.emission-name`)} :</span> <span style="word-break: break-all;">${data.radioAndTVMediaStatistics?.emissionName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.statistics.radio-and-tv.viewers`)} :</span> <span style="word-break: break-all;">${data.radioAndTVMediaStatistics?.viewers ?? ''}</span></div>
  </section>
        `;
  }
  // Coverage of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Couverture Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.print.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.print.total-pages`)} :</span> <span style="word-break: break-all;">${data.mediaCoveragePrint?.totalPages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.print.article-length`)} :</span> <span style="word-break: break-all;">${data.mediaCoveragePrint?.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.print.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoveragePrint!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Couverture Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.online.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.online.article-length`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageOnline?.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.online.article-thematic`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageOnline?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.online.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoverageOnline!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Couverture TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.radio-and-tv.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.radio-and-tv.article-thematic`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageTvOrRadio?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.coverage.radio-and-tv.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoverageTvOrRadio!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.departure-point.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.departure-point.city`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.departurePoint?.city ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.departure-point.country`)} :</span> <span style="word-break: break-all;">${countries.getName(data.travelInformation.departurePoint.country, countryLocale) ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.title`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.departurePoint?.outwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.return-journey.title`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.returnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.travel-reduction.title`)} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelInformation?.travelReductions?.map((x) => `<li>${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.travel-reduction.${x}`)}</li>`).join('')}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.travel-information.last-visit`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.lastVisit ? DateTime.fromSQL(data.travelInformation.lastVisit).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span></div>
  </section>
`;

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.titles.title`)} :</span> <span>${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.titles.${data.personalInformation.title}`)}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.first-name`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.firstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.last-name`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.lastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.birth-date`)} :</span> <span>${DateTime.fromSQL(data.personalInformation.birthday!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.phone-number`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.phoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.email`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.email ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.address.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.address.street-address`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.streetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.address.city`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.city}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.address.postal-code`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.postalcode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.address.country`)} :</span> <span style="word-break: break-all;">${countries.getName(data.personalInformation.address.country, countryLocale) ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.spoken-languages.title`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.spokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.freelance`)} :</span> <span>${data.personalInformation.freelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.passport.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.passport.number`)} :</span> <span style="word-break: break-all;">${data.personalInformation.passport.number ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.passport.validity`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.passport?.validity ? DateTime.fromSQL(data.personalInformation.passport.validity).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.emergency-contacts.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        ${
          data.personalInformation?.emergencyContacts?.map(
            (x) => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`)} :</span> <span style="word-break: break-all;">${x.name}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span style="word-break: break-all;">${x.phoneNumber}</span>
          </li>
        `
          ) ?? ''
        }
      </ul>
    </div>
  </section>
`;

  html += `<!-- Divers -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">Informations complémentaires</h2>
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
