
import { MAIL_DEFAULT_RECIPIENTS, MAIL_FROM, MAIL_TO } from "$env/static/private";
import { PUBLIC_MANDRILL_API_KEY } from "$env/static/public";
import mailchimp, { type MessagesMessage } from "@mailchimp/mailchimp_transactional";

const recipients = (MAIL_DEFAULT_RECIPIENTS ?? '').split(',').concat(MAIL_TO).filter(x => x !== undefined && x !== "");

/**
 * send Email to LT and to the end user.
 * info: from_email is override to use environment variable
 *
 * @param intern_mail used to send mail to LT
 * @param external_mail used to send mail to end user
 */
export const sendEmail = async ({ intern_mail, external_mail }: { intern_mail: { from_name: string, subject: string, html: string, images?: mailchimp.MessageImage[], attachments?: mailchimp.MessageAttachment[] }, external_mail?: MessagesMessage }): Promise<{
    internal_reponse: mailchimp.MessagesSendResponse[],
    external_response?: mailchimp.MessagesSendResponse[],
}> => {


    const mailchimpTx = mailchimp(PUBLIC_MANDRILL_API_KEY);

    /**
     * Using the `send` API from Mandrill/Mailchimp, this is considered as an "outbound" email,
     * meaning from LT to the world.
     *
     * If from_email is set with any other domain than lausanne-tourisme.ch, then it will be rejected.
     *
     * Alternatives: either use noreply@lausanne-tourisme.ch as from_email, or use nodemailer with LT's
     * mail provider.
     * */
    const mail: MessagesMessage = {
        from_email: MAIL_FROM,
        subject: intern_mail.subject,
        html: intern_mail.html,
        to: recipients.map((recipient: string) => {
            return {
                email: recipient,
                type: "to",
            }
        }),
        attachments: intern_mail.attachments ?? [],
        images: intern_mail.images ?? [],
        preserve_recipients: false,
        inline_css: true,
        important: false
    }

    const internal_reponse = await mailchimpTx.messages.send({ message: mail }) as mailchimp.MessagesSendResponse[];

    const external_response = external_mail ? await mailchimpTx.messages.send({
        message: {
            ...external_mail,
            from_email: MAIL_FROM,
        }
    }) as mailchimp.MessagesSendResponse[] : undefined;

    return { internal_reponse, external_response };
}