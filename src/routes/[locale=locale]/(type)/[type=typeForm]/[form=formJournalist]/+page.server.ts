import { Forms, MediaTypes, RouteTypes, ConsentsTypes, type ConsentType } from '$enums';
import { API_HTML_TO_PDF, MAIL_FROM } from '$env/static/private';
import { verifyIfHuman } from '$lib/helpers/index.server';
import { sendEmail } from '$lib/services/mails.server';
import { supportedLocales, t, type Locale } from '$lib/translations';
import type Mailchimp from '@mailchimp/mailchimp_transactional';
import { fail, redirect } from '@sveltejs/kit';
import countries from 'i18n-iso-countries';
import de from 'i18n-iso-countries/langs/de.json';
import en from 'i18n-iso-countries/langs/en.json';
import fr from 'i18n-iso-countries/langs/fr.json';
import { DateTime } from 'luxon';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from './$types';
import { schemaStep4, type Schema } from './schema';
import * as apsis from '$lib/services/apsis.server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countriesByLocale: Record<string, any> = { en, fr, de };
const lastStep = zod4(schemaStep4);

export const load = async ({ parent }) => {
  const [{ locale }, form] = await Promise.all([parent(), superValidate(lastStep)]);

  countries.registerLocale(countriesByLocale[locale]);

  return {
    countries: countries.getNames(locale, { select: 'official' }),
    form
  };
};

export const actions = {
  default: async ({ request, params, cookies }) => {
    const formdata = await request.formData();
    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, lastStep);

    if (!form.valid) {
      console.error('Form invalid');
      return fail(400, { form });
    }

    const profileCreated = await apsis.createProfile(form.data.personalInformation.email);
    if (!profileCreated) {
      console.error(`Form can't create an Apsis profile`);
      return fail(400, { form });
    }

    const attributesUpdated = await apsis.updateProfileAttributes({
      email: form.data.personalInformation.email,
      attributes: {
        // PRESS - Nom média
        'usercreated.attributes.press_-_nom_mdia-mnikzmwwgw': form.data.mediaName,
        // PRESS - Thématique du média
        'usercreated.attributes.press_-_thmatique_du_mdia-dpju2awz9f': form.data.thematic,
        // PRESS - Profil de l'audience
        'usercreated.attributes.press_-_profil_de_laudience-434y7go1r9': form.data.audienceProfile,
        // PRESS - Type de médias
        'usercreated.attributes.press_-_type_de_mdias-8iz76e7cqf': form.data.mediaTypes.join(', '),
        // PRESS - Objet de la demande
        'usercreated.attributes.press_-_objet_de_la_demande-59ljafr7jf': form.data.objectRequest,
        // PRESS - stats print - lieux de diffusion
        'usercreated.attributes.press_-_stats_print_-_lieux_de_diffusion-sny3omfvn4':
          form.data.printMediaStatistics?.broadcastLocation,
        // PRESS - stats print - nombre d'exemplaires
        'usercreated.attributes.press_-_stats_print_-_nombre_dexemplaires-gv56zq433f':
          form.data.printMediaStatistics?.copies,
        // PRESS - stats print - nombre de lecteurs
        'usercreated.attributes.press_-_stats_print_-_nombre_de_lecteurs-1c7lottbnm':
          form.data.printMediaStatistics?.readers,
        // PRESS - stats radio/tv - Nom de l'émission
        'usercreated.attributes.press_-_stats_radiotv_-_nom_de_lmission-pkli1azlc8':
          form.data.radioAndTVMediaStatistics?.emissionName,
        // PRESS - stats radio/tv - nombre d'auditeurs
        'usercreated.attributes.press_-_stats_radiotv_-_nombre_dauditeurs-yglhf6972f':
          form.data.radioAndTVMediaStatistics?.viewers,
        // PRESS - stats site web - nombre de pages vues par mois
        'usercreated.attributes.press_-_stats_site_web_-_nombre_de_pages_-78nx897yjd':
          form.data.onlineMediaStatistics?.monthlyPageViews ?? undefined,
        // PRESS - stats site web - url
        'usercreated.attributes.press_-_stats_site_web_-_url-fpko4in3um':
          form.data.onlineMediaStatistics?.website,
        // PRESS - stats site web - visiteurs uniques par mois
        'usercreated.attributes.press_-_stats_site_web_-_visiteurs_unique-aodjvepkyu':
          form.data.onlineMediaStatistics?.monthlyUniqueVisitors,
        // PRESS - couverture médiatique radio/tv - thématique de l'émission
        'usercreated.attributes.press_-_couverture_mdiatique_radiotv_-_th-vk4cdag1hu':
          form.data.mediaCoverageTvOrRadio?.articleThematic,
        // PRESS - couverture médiatique radio/tv - date de sortie de l'émission
        'usercreated.attributes.press_-_couverture_mdiatique_radiotv_-_da-k4z98wlusn':
          form.data.mediaCoverageTvOrRadio?.publishDate,
        // PRESS - couverture médiatique print - nombre de pages
        'usercreated.attributes.press_-_couverture_mdiatique_print_-_nomb-xxx6c33coz':
          form.data.mediaCoveragePrint?.totalPages,
        // PRESS - couverture médiatique print - Longueur de l'article
        'usercreated.attributes.press_-_couverture_mdiatique_print_-_long-2wgqzpcyws':
          form.data.mediaCoveragePrint?.articleLength,
        // PRESS - couverture médiatique print - date de sortie de l'article
        'usercreated.attributes.press_-_couverture_mdiatique_print_-_date-knfrd93d8l':
          form.data.mediaCoveragePrint?.publishDate,
        // PRESS - couverture médiatique site web - thématique de l'article
        'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_t-2u34gt8m9i':
          form.data.mediaCoverageOnline?.articleThematic,
        // PRESS - couverture médiatique site web - date de sortie de l'article
        'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_d-51ziynjuvl':
          form.data.mediaCoverageOnline?.publishDate,
        // PRESS - couverture médiatique site web - longueur de l'article
        'usercreated.attributes.press_-_couverture_mdiatique_site_web_-_l-nhda9bgdj3':
          form.data.mediaCoverageOnline?.articleLength,
        // PRESS - info voyage - pays départ
        'usercreated.attributes.press_-_info_voyage_-_pays_dpart-2qcy4rye1g':
         countries.getName(form.data.travelInformation.departurePoint.country, params.locale),
        // PRESS - info voyage - trajet aller
        'usercreated.attributes.press_-_info_voyage_-_trajet_aller-2jsn1a11d1':
          form.data.travelInformation.departurePoint.outwardJourney ?? '',
        // PRESS - info voyage - ville départ
        'usercreated.attributes.press_-_info_voyage_-_ville_dpart-9vum9j2my2':
          form.data.travelInformation.departurePoint.city,
        // PRESS - info voyage - trajet retour
        'usercreated.attributes.press_-_info_voyage_-_trajet_retour-ow47wl9fsx':
          form.data.travelInformation.returnJourney ?? '',
        // PRESS - info voyage - abonnements train
        'usercreated.attributes.press_-_info_voyage_-_abonnements_train-hil7po868z':
          form.data.travelInformation.travelReductions.join(', '),
        // PRESS - info voyage - dernière visite
        'usercreated.attributes.press_-_info_voyage_-_dernire_visite-vld8zpxgep':
          form.data.travelInformation.lastVisit ?? '',
        // PRESS - info personelles - Titre
        'usercreated.attributes.press_-_info_personelles_-_titre-wkn2jhthui':
          form.data.personalInformation.title,
        // PRESS - info personelles - Prénom
        'usercreated.attributes.press_-_info_personelles_-_prnom-mbqrq9wdyh':
          form.data.personalInformation.firstName,
        // PRESS - info personelles - Nom
        'usercreated.attributes.press_-_info_personelles_-_nom-cxjbhy5hty':
          form.data.personalInformation.lastName,
        // PRESS - info personelles - date de naissance
        'usercreated.attributes.press_-_info_personelles_-_date_de_naissa-24imaurrq5':
          form.data.personalInformation.birthday,
        // PRESS - info personelles - Numéro de Téléphone
        'usercreated.attributes.press_-_info_personelles_-_numro_de_tlpho-al4q3cx5jz':
          form.data.personalInformation.phoneNumber,
        // PRESS - info personelles - email
        'usercreated.attributes.press_-_info_personelles_-_email-8b44zvzpt6':
          form.data.personalInformation.email,
        // PRESS - info personelles - langues parlées
        'usercreated.attributes.press_-_info_personelles_-_langues_parles-ttfydkakad':
          form.data.personalInformation.spokenLanguages,
        // PRESS - info personelles - conditions médicales
        'usercreated.attributes.press_-_info_personelles_-_conditions_mdi-4djm12gpt1':
          form.data.personalInformation.medicalAndPhysicalCondition ?? '',
        // PRESS - info personelles - allergies
        'usercreated.attributes.press_-_info_personelles_-_allergies-8ja4yjsxx4':
          form.data.personalInformation.allergies,
        // PRESS - info personelles - freelance
        'usercreated.attributes.press_-_info_personelles_-_freelance-obp6v6zi8j':
          form.data.personalInformation.freelance,
        // PRESS - info personelles - numéro de passport
        'usercreated.attributes.press_-_info_personelles_-_numro_de_passp-qzpnkyyl64':
          form.data.personalInformation.passport.number,
        // PRESS - info personelles - validité du passport
        'usercreated.attributes.press_-_info_personelles_-_validit_du_pas-63lbaolk83':
          form.data.personalInformation.passport.validity,
        // PRESS - info personelles - Adresse
        'usercreated.attributes.press_-_info_personelles_-_adresse-4j5rjm99hd':
          form.data.personalInformation.address.streetAddress,
        // PRESS - info personelles - Ville
        'usercreated.attributes.press_-_info_personelles_-_ville-xjpq3n6cbi':
          form.data.personalInformation.address.city,
        // PRESS - info personelles - Zip
        'usercreated.attributes.press_-_info_personelles_-_zip-yefz81y17u':
          form.data.personalInformation.address.postalcode,
        // PRESS - info personelles - Pays
        'usercreated.attributes.press_-_info_personelles_-_pays-tdg34z5ltt':
          form.data.personalInformation.address.country,
        // PRESS - info personelles - contacts d'urgence
        'usercreated.attributes.press_-_info_personelles_-_contacts_durge-l9fvrao7bi':
          form.data.personalInformation.emergencyContacts
            .map((X) => `${X.name} (${X.phoneNumber})`)
            .join('; '),
        // PRESS - info personelles - assurance voyage
        'usercreated.attributes.press_-_info_personelles_-_assurance_voya-ctvpxedjyw':
          form.data.travelInsuranceCoveringSwitzerland,
        // PRESS - newsletter
        'usercreated.attributes.press_-_newsletter-omm8pihlcr': form.data.newsletter,
        // PRESS - info personelles - remarques
        'usercreated.attributes.press_-_info_personelles_-_remarques-5lrlrl21ta':
          form.data.remarks ?? '',

        // -------------------------------------- ATTRIBUTES FOR APSIS & CRM --------------------------------------

        // Birthdate (YYYY-MM-DD)
        'com.apsis1.attributes.birthdate': form.data.personalInformation.birthday,
        // Profile First Name
        'com.apsis1.attributes.firstname': form.data.personalInformation.firstName,
        // Last Name of profile
        'com.apsis1.attributes.lastname': form.data.personalInformation.lastName,
        // Primary mobile phone number
        'com.apsis1.attributes.mobile': form.data.personalInformation.phoneNumber,
        // Primary e-mail address
        'com.apsis1.attributes.email': form.data.personalInformation.email,
        // CRM - Field - Language
        'usercreated.attributes.langue_crm-98h3ud5p4v': (() => {
          switch (params.locale) {
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
        "usercreated.attributes.crm_-_field_-_title-lzfs6a6wjk": (() => {
          switch (form.data.personalInformation.title) {
            case 'mr':
              return {
                fr: "M.",
                en: "Mr.",
                de: "Herr",
              }[params.locale];
            case 'mrs':
              return {
                fr: "Mme",
                en: "Mrs.",
                de: "Frau",
              }[params.locale];
            case 'they':
              return {
                fr: "-",
                en: "-",
                de: "-",
              }[params.locale];
          }
        })(),
        // CRM - Fields - Full Title
        "usercreated.attributes.crm_-_field_-_full_title-9ilaifqngn": (() => {
          switch (form.data.personalInformation.title) {
            case 'mr':
              return {
                fr: "Monsieur",
                en: "Mister",
                de: "Herr",
              }[params.locale];
            case 'mrs':
              return {
                fr: "Madame",
                en: "Mistress",
                de: "Frau",
              }[params.locale];
            case 'they':
              return {
                fr: "-",
                en: "-",
                de: "-",
              }[params.locale];
          }
        })(),
        // CRM - Fields - Account Manager
        "usercreated.attributes.crm_-_field_-_account_manager-wg3agn5erk": 213,
        // CRM - Fields - Media Sub-Type
        "usercreated.attributes.crm_-_field_-_media_sub-type-1htwf2zbbw": form.data.personalInformation.freelance ? 2 : 1,
        // CRM - Fields - Type
        "usercreated.attributes.crm_-_fields_-_type-kg83vtqoiv": 1,// Média

        //// ADRESSE
        // CRM - Fields - Country 
        "com.apsis1.integrations.efficy-enterprise-2.attributes.crm_-_pay-ukbzkdg2oh":  countries.getName(form.data.travelInformation.departurePoint.country, 'fr'),
        // CRM - Fields - Post code
        "usercreated.attributes.crm_-_fields_-_post_code-sklez45cs6": form.data.personalInformation.address.postalcode,
        // CRM - Fields - Street
        "usercreated.attributes.crm_-_fields_-_street-ym828bzua3": form.data.personalInformation.address.streetAddress,
        // CRM - Fields - Town/City 
        "usercreated.attributes.crm_-_fields_-_towncity-c3klcectbd": form.data.personalInformation.address.city,
      }
    });

    if (!attributesUpdated) {
      console.error(`Form can't update Apsis attributes`);
      return fail(400, { form });
    }

    const consents: ConsentType[] = form.data.newsletter
      ? [ConsentsTypes.MeidaPress, ConsentsTypes.NewsletterPress]
      : [ConsentsTypes.MeidaPress];

    consents.forEach(async (consentType) => {
      const consentAdded = await apsis.addProfileToMailConsents({
        email: form.data.personalInformation.email,
        consentType
      });

      if (!consentAdded) {
        console.error(`Form can't add consents to the profile in Apsis`);
        return fail(400, { form });
      }
    });

    const sendWithSuccess = await sendFormByEmail({
      locale: params.locale as Locale,
      mediaProfileJournalist: form.data
    });

    if (sendWithSuccess) {
      return redirect(
        303,
        `/${params.locale}/${t.get(`route.${RouteTypes.Form}.slug`)}/${t.get(`route.${RouteTypes.Form}.${Forms.Thanks}.slug`)}`
      );
    }

    setFlash(
      {
        type: 'error',
        message: t.get(`${RouteTypes.Form}.error-on-sending`)
      },
      cookies
    );
    return fail(500, { form, message: 'Please retry later.' });
  }
};

export const entries: EntryGenerator = () => {
  return supportedLocales.flatMap((locale) => {
    return {
      locale,
      type: t.get(`route.${RouteTypes.Form}.slug`),
      form: t.get(`route.${RouteTypes.Form}.${Forms.Journalist}.slug`)
    };
  });
};

const sendFormByEmail = async ({
  mediaProfileJournalist,
  locale
}: {
  mediaProfileJournalist: Schema;
  locale: Locale;
}) => {
  const attachments: Mailchimp.MessageAttachment[] = [];
  const html = generateMailContent({ data: mediaProfileJournalist, userLocale: locale });

  const pdfResponse = await fetch(API_HTML_TO_PDF, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html,
      filename: '[Formulaire] - Journaliste'
    })
  });

  if (pdfResponse.ok) {
    // Convert stream to base64
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    const pdf = {
      name: '[Formulaire] - Journaliste.pdf',
      type: 'application/pdf',
      content: pdfBase64
    };

    attachments.push(pdf);
  }

  const { internal_reponse, external_response } = await sendEmail({
    intern_mail: {
      from_name: 'No Reply - Press',
      subject: '[Formulaire] - Journaliste',
      html,
      attachments
    },
    external_mail: mediaProfileJournalist.personalInformation?.email
      ? {
          from_email: MAIL_FROM,
          from_name: t.get(`${RouteTypes.Form}.email.from-name`),
          subject: t.get(`${RouteTypes.Form}.email.subject`, {
            form: t.get(`${RouteTypes.Form}.${Forms.Journalist}.title`)
          }),
          html: `<p>${t.get(`${RouteTypes.Form}.email.content`, { name: `${mediaProfileJournalist.personalInformation.firstName} ${mediaProfileJournalist.personalInformation.lastName}` })}</p><p><i>${t.get(`${RouteTypes.Form}.email.automatic-mail-disclaimer`)}</i></p>`,
          to: [
            {
              email: mediaProfileJournalist.personalInformation.email,
              type: 'to'
            }
          ]
        }
      : undefined
  });

  return (
    internal_reponse.every((x) => x.status === 'sent' || x.status === 'queued') &&
    (external_response?.every((x) => x.status === 'sent' || x.status === 'queued') ?? true)
  );
};

const generateMailContent = ({ data, userLocale }: { data: Schema; userLocale: Locale }) => {
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
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.media-name`)} :</span> <span style="word-break: break-all;">${data.mediaName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.media-thematic`)} :</span> <span style="word-break: break-all;">${data.thematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.audience-profile`)} :</span> <span style="word-break: break-all;">${data.audienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.types.title`)} :</span> <span>${data.mediaTypes?.map((x) => t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.types.${x}`)).join(', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.object-request`)} :</span> <span style="word-break: break-all;">${data.objectRequest ?? ''}</span></div>
  </section>
`;
  // statistics of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Statistiques Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.broadcast-location`)} :</span> <span style="word-break: break-all;">${data.printMediaStatistics?.broadcastLocation ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.copies`)} :</span> <span>${data.printMediaStatistics?.copies ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.print.readers`)} :</span> <span>${data.printMediaStatistics?.readers ?? ''}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Statistiques Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.website`)} :</span> <span style="word-break: break-all;">${data.onlineMediaStatistics?.website ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.monthly-unique-visitors`)} :</span> <span>${data.onlineMediaStatistics?.monthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.online.monthly-page-views`)} :</span> <span>${data.onlineMediaStatistics?.monthlyPageViews ?? ''}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Statistiques TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.emission-name`)} :</span> <span style="word-break: break-all;">${data.radioAndTVMediaStatistics?.emissionName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.statistics.radio-and-tv.viewers`)} :</span> <span style="word-break: break-all;">${data.radioAndTVMediaStatistics?.viewers ?? ''}</span></div>
  </section>
        `;
  }
  // Coverage of the media
  if (data.mediaTypes?.includes(MediaTypes.Print)) {
    html += `<!-- Couverture Print -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.total-pages`)} :</span> <span style="word-break: break-all;">${data.mediaCoveragePrint?.totalPages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.article-length`)} :</span> <span style="word-break: break-all;">${data.mediaCoveragePrint?.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.print.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoveragePrint!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Online)) {
    html += `<!-- Couverture Online -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.article-length`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageOnline?.articleLength ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.article-thematic`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageOnline?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.online.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoverageOnline!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }
  if (data.mediaTypes?.includes(MediaTypes.Tv) || data.mediaTypes?.includes(MediaTypes.Radio)) {
    html += `<!-- Couverture TV/Radio -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.article-thematic`)} :</span> <span style="word-break: break-all;">${data.mediaCoverageTvOrRadio?.articleThematic ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.coverage.radio-and-tv.publish-date`)} :</span> <span>${DateTime.fromSQL(data.mediaCoverageTvOrRadio!.publishDate!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
  </section>
        `;
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.city`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.departurePoint?.city ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.country`)} :</span> <span style="word-break: break-all;">${countries.getName(data.travelInformation.departurePoint.country, userLocale)}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.departure-point.outward-journey.title`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.departurePoint?.outwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.return-journey.title`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.returnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.title`)} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelInformation?.travelReductions?.map((x) => `<li>${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.travel-reduction.${x}`)}</li>`).join('')}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.travel-information.last-visit`)} :</span> <span style="word-break: break-all;">${data.travelInformation?.lastVisit ? DateTime.fromSQL(data.travelInformation.lastVisit).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span></div>
  </section>
`;

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.title`)} :</span> <span>${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.titles.${data.personalInformation.title}`)}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.first-name`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.firstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.last-name`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.lastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.birth-date`)} :</span> <span>${DateTime.fromSQL(data.personalInformation.birthday!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.phone-number`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.phoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.email`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.email ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.street-address`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.streetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.city}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.postal-code`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.postalcode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.address.city`)} :</span> <span style="word-break: break-all;">${data.personalInformation.address.country}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.spoken-languages.title`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.spokenLanguages ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.freelance`)} :</span> <span>${data.personalInformation.freelance ? 'Oui' : 'Non'}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.number`)} :</span> <span style="word-break: break-all;">${data.personalInformation.passport.number ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.passport.validity`)} :</span> <span style="word-break: break-all;">${data.personalInformation?.passport?.validity ? DateTime.fromSQL(data.personalInformation.passport.validity).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        ${
          data.personalInformation?.emergencyContacts?.map(
            (x) => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.name`)} :</span> <span style="word-break: break-all;">${x.name}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.Journalist}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span style="word-break: break-all;">${x.phoneNumber}</span>
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
