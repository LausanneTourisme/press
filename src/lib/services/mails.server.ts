import { ENABLE_MAILCHIMP } from '$app/env/private';
import { sendMail as sendMailchimp } from './mailchimp.server';
import { sendMail as sendNodemailer } from './nodemailer.server';
import type { InternMail, ExternalMail } from '#lib/types/mail.types.js';

export const sendEmail = async ({
  intern_mail,
  external_mail
}: {
  intern_mail: InternMail;
  external_mail?: ExternalMail;
}) => {
  if (ENABLE_MAILCHIMP) {
    return await sendMailchimp({ intern_mail, external_mail });
  }
  return await sendNodemailer({ intern_mail, external_mail });
};
