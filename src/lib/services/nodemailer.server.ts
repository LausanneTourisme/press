import {
  MAIL_DEFAULT_RECIPIENTS,
  MAIL_FROM,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_TO,
  MAIL_USERNAME
} from '$env/static/private';
import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { InternMail, ExternalMail, MailAttachment } from '$types/mail.types';

let transporter: Mail<SMTPTransport.SentMessageInfo> | undefined;

const getTransporter = (): Mail<SMTPTransport.SentMessageInfo> => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: Number(MAIL_PORT) === 465,
      auth: { user: MAIL_USERNAME, pass: MAIL_PASSWORD }
    });
  }
  return transporter;
};

const recipients = (MAIL_DEFAULT_RECIPIENTS ?? '')
  .split(',')
  .concat(MAIL_TO)
  .filter((x) => x !== undefined && x !== '');

const toAttachment = (a: MailAttachment): Mail.Attachment => ({
  filename: a.name,
  content: Buffer.from(a.content, 'base64'),
  contentType: a.type
});

export const sendMail = async ({
  intern_mail,
  external_mail
}: {
  intern_mail: InternMail;
  external_mail?: ExternalMail;
}) => {
  const t = getTransporter();

  const internal_reponse = await t.sendMail({
    from: `"${intern_mail.from_name}" <${MAIL_FROM}>`,
    to: recipients,
    subject: intern_mail.subject,
    html: intern_mail.html,
    attachments: [
      ...(intern_mail.attachments ?? []).map(toAttachment),
      ...(intern_mail.images ?? []).map((img) => ({ ...toAttachment(img), cid: img.name }))
    ]
  });

  const external_response = external_mail
    ? await t.sendMail({
        from: `"${external_mail.from_name ?? ''}" <${MAIL_FROM}>`,
        to: external_mail.to.map((r) => r.email),
        subject: external_mail.subject,
        html: external_mail.html
      })
    : undefined;

  return (
    internal_reponse.accepted.length > 0 &&
    internal_reponse.rejected.length === 0 &&
    (external_response
      ? external_response.accepted.length > 0 && external_response.rejected.length === 0
      : true)
  );
};
