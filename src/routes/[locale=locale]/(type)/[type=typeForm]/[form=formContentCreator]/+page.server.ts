import { Forms, RouteTypes, SocialNetworks, type SocialNetwork } from '$enums';
import { API_HTML_TO_PDF, MAIL_FROM } from '$env/static/private';
import { verifyIfHuman } from '$lib/helpers/index.server';
import { sendEmail } from '$lib/helpers/mails.server';
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

export const load = async ({ parent }) => {
  const [{ locale }, form] = await Promise.all([parent(), superValidate(lastStep)]);

  countries.registerLocale(countriesByLocale[locale]);

  return {
    countries: Object.values<string>(countries.getNames(locale, { select: 'official' })).sort(),
    form
  };
};

export const actions = {
  default: async ({ request, params, cookies }) => {
    const formdata = await request.formData();

    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, lastStep);

    if (!form.valid) {
      return fail(400, { form });
    }

    const sendWithSuccess = await sendFormByEmail({
      formdata,
      locale: params.locale as Locale,
      mediaProfileContentCreator: form.data
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
      form: t.get(`route.${RouteTypes.Form}.${Forms.ContentCreator}.slug`)
    };
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

  const html = generateMailContent({
    data: mediaProfileContentCreator,
    userLocale: locale,
    images
  });

  const attachments: Mailchimp.MessageAttachment[] = [];
  const pdfResponse = await fetch(API_HTML_TO_PDF, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html: generateMailContent({
        data: mediaProfileContentCreator,
        userLocale: locale,
        images,
        useImageB64: true
      }),
      filename: '[Formulaire] - Createur de contenu.pdf'
    })
  });

  if (pdfResponse.ok) {
    // Convert stream to base64
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    const pdf = {
      name: '[Formulaire] - Createur de contenu.pdf',
      type: 'application/pdf',
      content: pdfBase64
    };

    attachments.push(pdf);
  }

  const { internal_reponse } = await sendEmail({
    intern_mail: {
      from_name: 'No Reply - Press',
      subject: '[Formulaire] - Createur de contenu',
      html,
      images,
      attachments
    },
    external_mail: mediaProfileContentCreator.personalEmail
      ? {
          from_email: MAIL_FROM,
          from_name: t.get(`${RouteTypes.Form}.email.from-name`),
          subject: t.get(`${RouteTypes.Form}.email.subject`, {
            form: t.get(`${RouteTypes.Form}.${Forms.Journalist}.title`)
          }),
          html: `<p>${t.get(`${RouteTypes.Form}.email.content`, { name: `${mediaProfileContentCreator.personalFirstName} ${mediaProfileContentCreator.personalLastName}` })}</p><p><i>${t.get(`${RouteTypes.Form}.email.automatic-mail-disclaimer`)}</i></p>`,
          to: [
            {
              email: mediaProfileContentCreator.personalEmail,
              type: 'to'
            }
          ]
        }
      : undefined
  });

  return internal_reponse.every((x) => x.status === 'sent' || x.status === 'queued');
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
  useImageB64
}: {
  data: Schema;
  userLocale: Locale;
  images: MailImage[];
  useImageB64?: boolean;
}) => {
  // convert undefine to false and keep bool with right value
  // eslint-disable-next-line no-extra-boolean-cast
  const isMailchimpEmail = !!!useImageB64; // default value false

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
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.social-media-information`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.content-positioning`)} :</span>
      &nbsp;
      <span>${data.contentPositioning ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.target-audience`)} :</span>
      &nbsp;
      <span>${data.targetAudience ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.title`)} :</span>
      &nbsp;
      <span>${data.onlinePresence?.map((x) => t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.online-presence.${x}`)).join(', ') ?? ''}</span>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.object-request`)} :</span>
      &nbsp;
      <span>${data.objectRequest ?? ''}</span>
    </div>
  </section>
  `;

  // statistics of the media
  if (data.onlinePresence?.includes(SocialNetworks.Instagram)) {
    html += `<!-- Statistiques Instagram -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.profile-url`)} :</span> <span>${data.instagramProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.subscriber-statistics-screenshots.title`)} :
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
        ${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.instagram.accounts-that-responded-screenshots.title`)} :
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
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.profile-url`)} :</span> <span>${data.tiktokProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.tiktok.subscriber-statistics-screenshots.title`)} :
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
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.profile-url`)} :</span> <span>${data.youtubeProfileURL ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">
        ${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.youtube.subscriber-statistics-screenshots.title`)} :
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
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.url`)} :</span> <span>${data.blogURL ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.audience-profile.title`)} :</span> <span>${data.blogAudienceProfile ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.performances.monthly-unique-visitors`)} :</span> <span>${data.blogMonthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.statistics.blog.performances.montlhy-page-views`)} :</span> <span>${data.blogMonthlyPageViews ?? ''}</span></div>
  </section>
`;
  }

  html += `<!-- Informations de voyage -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.city`)} :</span> <span>${data.travelDepartureCity ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.country`)} :</span> <span>${data.travelDepartureCountry ?? ''}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.departure-point.outward-journey.title`)} :</span> <span>${data.travelOutwardJourney?.replaceAll('\n', ', ') ?? ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.return-journey.title`)} :</span> <span>${data.travelReturnJourney?.replaceAll('\n', ', ') ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.title`)} :</span> <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">${data.travelReductions?.map((x) => `<li>${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.travel-reduction.${x}`)}</li>`).join('')}</ul></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.travel-information.last-visit`)} :</span> <span>${data.travelLastVisit ? DateTime.fromSQL(data.travelLastVisit).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span></div>
  </section>
`;

  html += `<!-- Informations personnelles -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <h2 style="font-weight: 800;width: 100%;text-align: left;margin-top: 8px;margin-bottom: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.title`)}</h2>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.title`)} :</span> <span>${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.titles.${data.personalTitle}`)}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.first-name`)} :</span> <span>${data.personalFirstName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.last-name`)} :</span> <span>${data.personalLastName ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.birth-date`)} :</span> <span>${DateTime.fromSQL(data.personalBirthday!).setLocale('fr').toFormat('dd MMMM yyyy')}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.phone-number`)} :</span> <span>${data.personalPhoneNumber ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.email`)} :</span> <span>${data.personalEmail ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.street-address`)} :</span> <span>${data.addressStreetAddress}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`)} :</span> <span>${data.addressCity}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.postal-code`)} :</span> <span>${data.addressPostalCode}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.address.city`)} :</span> <span>${data.addressCountry}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.spoken-languages.title`)} :</span> <span>${data.personalSpokenLanguages ?? ''}</span></div>

    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.number`)} :</span> <span>${data.passportNumber}</span>
        </li>
        <li>
          <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.passport.validity`)} :</span> <span>${data.passportValidity ? DateTime.fromSQL(data.passportValidity).setLocale('fr').toFormat('dd MMMM yyyy') : ''}</span>
        </li>
      </ul>
    </div>
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
      `;

  if (typeof data.emergencyContactNames === 'string') {
    html += `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`)} :</span> <span>${data.emergencyContactNames}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span>${data.emergencyContactPhones}</span>
          </li>
        `;
  } else {
    html +=
      data.emergencyContactNames
        ?.map(
          (_, index) => `
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.name`)} :</span> <span>${data.emergencyContactNames[index]}</span>
          </li>
          <li>
            <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Form}.${Forms.ContentCreator}.form.personal-information.emergency-contacts.phone-number`)} :</span> <span>${data.emergencyContactPhones[index]}</span>
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
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Remarques :</span> <span>${data.remarks ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">Newsletter :</span> <span>${data.newsletter ? 'Oui' : 'Non'}</span></div>
  </section>
</body>
</html>
  `;

  return html;
};
