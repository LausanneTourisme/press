import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

// Custom messages: valibot's defaults echo the received value, which would leak secrets in logs.
const optional = (schema: v.GenericSchema<string, string>) =>
  v.optional(v.union([v.literal(''), schema], 'is invalid'), '');

const text = v.optional(v.string(), '');
const flag = v.pipe(
  v.optional(v.picklist(['', 'true', 'false'], 'must be "true" or "false"'), ''),
  v.transform((input) => input === 'true')
);
const digits = optional(v.pipe(v.string(), v.digits('must contain digits only')));
const url = optional(v.pipe(v.string(), v.url('must be a valid URL')));
const email = optional(v.pipe(v.string(), v.email('must be a valid email')));
const emails = optional(
  v.pipe(
    v.string(),
    v.check(
      (input) => input.split(',').every((item) => v.is(v.pipe(v.string(), v.email()), item.trim())),
      'must be comma-separated emails'
    )
  )
);
const hostname = optional(
  v.pipe(v.string(), v.regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i, 'must be a hostname without protocol'))
);
const prefixed = (prefix: string) =>
  optional(v.pipe(v.string(), v.startsWith(prefix, `must start with "${prefix}"`)));

export const variables = defineEnvVars({
  PUBLIC_ENABLE_OFFLINE_MODE: { public: true, schema: flag },
  PUBLIC_GOOGLE_TAG_MANAGER_TOKEN: {
    public: true,
    schema: optional(v.pipe(v.string(), v.regex(/^GTM-[A-Z0-9]+$/, 'must look like "GTM-XXXX"')))
  },
  PUBLIC_BOTPOISON_PUBLICKEY: { public: true, schema: prefixed('pk_') },
  PUBLIC_MANDRILL_API_KEY: { public: true, schema: text },
  PUBLIC_CLOUDINARY_CNAME: { public: true, schema: hostname },
  PUBLIC_CLOUDINARY_UPLOAD_PRESET: { public: true, schema: text },
  PUBLIC_MAPTILER_URL: { public: true, schema: url },

  GRAPHQL_URL: { schema: url },
  GRAPHQL_TOKEN: { schema: text },
  GRAPHQL_AGENDA_TOKEN: { schema: text },
  GROUP_ID_PAGE_HIGHLIGHTS: { schema: digits },
  BOTPOISON_SKEY: { schema: prefixed('sk_') },

  ENABLE_CRM: { schema: flag },
  APSIS_CLIENT_ID: { schema: text },
  APSIS_CLIENT_SECRET: { schema: text },
  APSIS_KEYSPACE_DISCRIMINATOR: { schema: text },
  APSIS_SECTION_DISCRIMINATOR: { schema: text },
  APSIS_CONSENTS_MEDIA_PRESS_DISCRIMINATOR: { schema: text },
  APSIS_CONSENTS_CONTENT_MEDIA_CREATOR_DISCRIMINATOR: { schema: text },
  APSIS_CONSENTS_NEWSLETTER_PRESS_DISCRIMINATOR: { schema: text },
  APSIS_JOURNALIST_FORM_EVENT_VERSION_ID: { schema: digits },
  APSIS_CONTENT_CREATOR_FORM_EVENT_VERSION_ID: { schema: digits },
  APSIS_MEDIA_COVERAGE_FORM_EVENT_VERSION_ID: { schema: digits },

  ENABLE_MAILCHIMP: { schema: flag },
  MAIL_FROM: { schema: email },
  MAIL_TO: { schema: emails },
  MAIL_DEFAULT_RECIPIENTS: { schema: emails },
  MAIL_HOST: { schema: text },
  MAIL_PORT: { schema: digits },
  MAIL_USERNAME: { schema: text },
  MAIL_PASSWORD: { schema: text }
});
