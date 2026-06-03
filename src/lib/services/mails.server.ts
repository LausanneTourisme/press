import { ENABLE_MAILCHIMP } from '$env/static/private';
import { sendMail as sendMailchimp } from './mailchimp.server';
import { sendMail as sendNodemailer } from './nodemailer.server';
import type { InternMail, ExternalMail } from '$types/mail.types';

export const sendEmail = async ({
  intern_mail,
  external_mail
}: {
  intern_mail: InternMail;
  external_mail?: ExternalMail;
}) => {
  if (ENABLE_MAILCHIMP === 'true') {
    return await sendMailchimp({ intern_mail, external_mail });
  }
  return await sendNodemailer({ intern_mail, external_mail });
};
