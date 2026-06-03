export type MailAttachment = {
  name: string; // filename / cid for images
  type: string; // MIME type
  content: string; // base64 encoded
};

export type InternMail = {
  from_name: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
  images?: MailAttachment[];
};

export type ExternalMail = {
  from_email?: string;
  from_name?: string;
  subject: string;
  html: string;
  to: { email: string }[];
};
