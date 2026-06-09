import { Forms, RouteTypes } from '$enums';
import { API_HTML_TO_PDF, APSIS_MEDIA_COVERAGE_FORM_EVENT_VERSION_ID } from '$env/static/private';
import { isCRMEnabled, verifyIfHuman } from '$lib/helpers/index.server';
import * as apsis from '$lib/services/apsis.server';
import { sendEmail } from '$lib/services/mails.server';
import { supportedLocales, t, type Locale } from '$lib/translations';
import type { MailAttachment } from '$types/mail.types';
import { fail, redirect, type Cookies } from '@sveltejs/kit';
import { DateTime } from 'luxon';
import { setFlash } from 'sveltekit-flash-message/server';
import { superValidate, type SuperValidated } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { EntryGenerator } from './$types';
import { schema, type Schema } from './schema';

type MailImage = {
  filterName: string;
  type: string;
  name: string;
  content: string;
};

export const load = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=86400, stale-while-revalidate=3600' });
  return {
    form: await superValidate(zod4(schema))
  };
};

export const actions = {
  default: async ({ request, params, cookies, url }) => {
    const formdata = await request.formData();

    await verifyIfHuman(formdata);

    const form = await superValidate(formdata, zod4(schema));

    if (!form.valid) {
      console.log('fail!');
      return fail(400, { form });
    }
    if (isCRMEnabled && (await apsis.profileExists(form.data.personalEmail))) {
      if (
        !(await sendApsisCustomEvent({
          email: form.data.personalEmail,
          url_source: url.origin
        }))
      ) {
        return failError({ form, cookies, message: `Form can't send Apsis custom event` });
      }
    }

    const sendWithSuccess = await sendFormByEmail({
      formdata,
      locale: params.locale as Locale,
      mediaCoverage: form.data
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

export const entries: EntryGenerator = () => {
  return supportedLocales.flatMap((locale) => {
    return {
      locale,
      type: t.get(`route.${RouteTypes.Forms}.slug`),
      form: t.get(`route.${RouteTypes.Forms}.${Forms.MediaCoverage}.slug`)
    };
  });
};

const sendApsisCustomEvent = async ({
  email,
  url_source
}: {
  email: string;
  url_source: string;
}) => {
  return await apsis.customEvent({
    email,
    versionId: Number(APSIS_MEDIA_COVERAGE_FORM_EVENT_VERSION_ID),
    attributes: {
      source: url_source,
      datetime: DateTime.now().toFormat('dd.MM.yyyy HH:mm')
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
  mediaCoverage,
  locale
}: {
  formdata: FormData;
  mediaCoverage: Schema;
  locale: Locale;
}) => {
  const images = await getImagesFromForm(formdata);

  const html = generateMailContent({
    data: mediaCoverage,
    userLocale: locale,
    images
  });

  const attachments: MailAttachment[] = [];
  const pdfResponse = await fetch(API_HTML_TO_PDF, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      html: generateMailContent({
        data: mediaCoverage,
        userLocale: locale,
        images,
        useImageB64: true
      }),
      filename: '[Formulaire] - Retombées médiatiques.pdf'
    })
  });

  if (pdfResponse.ok) {
    // Convert stream to base64
    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    const pdf = {
      name: '[Formulaire] - Retombées médiatiques.pdf',
      type: 'application/pdf',
      content: pdfBase64
    };

    attachments.push(pdf);
  }

  return await sendEmail({
    intern_mail: {
      from_name: 'No Reply - Press',
      subject: '[Formulaire] - Retombées médiatiques',
      html,
      images,
      attachments
    }
  });
};

const getImagesFromForm = async (formdata: FormData) => {
  // required for mailchimp email body
  const images: MailImage[] = [];

  for (const [i, file] of formdata.getAll('scopeOfPosts').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        filterName: 'scopeOfPosts',
        type: getMimeType(file.name),
        name: `scopeOfPosts_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  for (const [i, file] of formdata.getAll('interactionWithPosts').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        filterName: 'interactionWithPosts',
        type: getMimeType(file.name),
        name: `interactionWithPosts_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  for (const [i, file] of formdata.getAll('averageStoryReach').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        filterName: 'averageStoryReach',
        type: getMimeType(file.name),
        name: `averageStoryReach_${i}`, // Use CID as the name for inline images
        content: await fileToBase64(file)
      });
    }
  }

  for (const [i, file] of formdata.getAll('interactionWithStories').entries()) {
    if (file instanceof File && file.size > 0) {
      images.push({
        filterName: 'interactionWithStories',
        type: getMimeType(file.name),
        name: `interactionWithStories_${i}`, // Use CID as the name for inline images
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

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Formulaire retombée médiatiques</title>
</head>
<body>
  <h1 style="font-weight: 800;width:100%;text-align: center;margin-bottom: 8px;">Formulaire Retonmbées médiatiques</h1>
  <h2 style="font-weight: 800;width: 100%;text-align: center;margin: 8px;">Langue du formulaire: ${t.get(`lang.${userLocale}`)}</h2>

  <!-- social networks -->
  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <div class="field" style="margin: 0.3rem 0;">
      <span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.social-networks.title`)} :</span>
      <ul style="margin: 8px 0 0 20px;list-style: none;padding: 0">
        ${
          data.socialNetworks
            ?.map(
              (x) => `<li>
          <span>${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.social-networks.${x}`)}</span>
        </li>`
            )
            .join(', ') ?? ''
        }
      </ul>
    </div>
  </section>

  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.username`)} :</span> <span style="word-break: break-all;">${data.username ?? ''}</span></div>
  </section>

  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.blog-post-url`)} :</span> <span style="word-break: break-all;">${data.blogPostURL ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.blog-monthly-unique-visitors`)} :</span> <span style="word-break: break-all;">${data.blogMonthlyUniqueVisitors ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.number-of-posts`)} :</span> <span style="word-break: break-all;">${data.numberOfPosts ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.number-of-clicks`)} :</span> <span style="word-break: break-all;">${data.numberOfClicks ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.scope-of-posts`)} :</span>
    ${
      images
        .filter((i) => i.filterName === 'scopeOfPosts')
        .map((image) => {
          if (isMailchimpEmail) {
            return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
          }
          return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
        })
        .join('\n') ?? ''
    }
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.posts-section.interaction-with-posts`)} :</span>
    ${
      images
        .filter((i) => i.filterName === 'interactionWithPosts')
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

    <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.number-of-stories`)} :</span> <span>${data.numberOfStories ?? ''}</span></div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.average-story-reach`)} :</span>
    ${
      images
        .filter((i) => i.filterName === 'averageStoryReach')
        .map((image) => {
          if (isMailchimpEmail) {
            return `<img src="cid:${image.name}" style="max-width: 500px; display: block; margin: 10px 0;" />`;
          }
          return `<br/><img src="data:${image.type};base64,${image.content}" style="max-width: 100%; margin: 10px 0;" />`;
        })
        .join('\n') ?? ''
    }
    </div>
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.stories-section.interaction-with-stories`)} :</span>
    ${
      images
        .filter((i) => i.filterName === 'interactionWithStories')
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


  <section style="margin: 10px;padding: 16px;border: 1px solid #ddd;border-radius: 8px;">
    <div class="field" style="margin: 0.3rem 0;"><span class="label" style="color: #666;font-weight: 600;font-size: 16px;margin-right: 8px;">${t.get(`${RouteTypes.Forms}.${Forms.MediaCoverage}.form.remarks.title`)} :</span> <span style="word-break: break-all;">${data.remarks ?? ''}</span></div>
  </section>
</body>
</html>`;
};
