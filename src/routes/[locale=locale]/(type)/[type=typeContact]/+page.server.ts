import { BOTPOISON_SKEY, MAIL_DEFAULT_RECIPIENTS, MAIL_FROM, MAIL_TO } from "$env/static/private";
import mailchimp, { type MessagesMessage } from "@mailchimp/mailchimp_transactional";
import { t } from "$lib/translations";
import Botpoison from "@botpoison/node";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { PUBLIC_MANDRILL_API_KEY } from "$env/static/public";

const recipients = (MAIL_DEFAULT_RECIPIENTS ?? '').split(',').concat(MAIL_TO).filter(x => x !== undefined && x !== "");

const verifyIfHuman = async (data: FormData) => {
    const botpoison = new Botpoison({
        secretKey: BOTPOISON_SKEY,
    });

    const _botpoison = data.get('_botpoison') as string | null;

    const { ok } = await botpoison.verify(_botpoison ?? '');

    if (!ok) {
        error(401, "No thank you, we don't like bots.");
    }
}

const validateEmail = (email: string | null | undefined) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
};

export const actions: Actions = {
    default: async ({ request, params }) => {
        const data = await request.formData();
        await verifyIfHuman(data);

        const { title, name, email, job_title, message } = {
            title: data.get('title') as string | null,
            name: data.get('name') as string | null,
            email: data.get('email') as string | null,
            job_title: data.get('job_title') as string | null,
            message: data.get('message') as string | null,
        }

        const nameMinimumCharacters = 3;
        const messageMinimumCharacters = 10;


        let errors: Record<string, {
            value?: any,
            incorrect: boolean,
            message: string,
        }> = {};

        if (!title) {
            errors.title = {
                value: title,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.radio-buttons"),
            }
        }

        if (!name || (name && name.trim().length < nameMinimumCharacters)) {
            errors.name = {
                value: name,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.text-length", { number: nameMinimumCharacters }),
            }
        }

        if (!message || (message && message.trim().length < messageMinimumCharacters)) {
            errors.message = {
                value: message,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.text-length", { number: messageMinimumCharacters }),
            }
        }

        if (!job_title) {
            errors.job_title = {
                value: job_title,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.select"),
            }
        }

        if (!validateEmail(email)) {
            errors.email = {
                value: email,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.mail"),
            }
        }

        if (Object.keys(errors).length > 0) {
            return fail(422, { fields: errors })
        }

        const html = `De <b>${title}</b> ${name}<br>
            <b>Profession</b>: ${job_title}<br><br>
            <b>Email</b>: <a href="mailto:${email}">${email}</a><br>
            <b>Langue du navigateur</b>: ${params.locale.toUpperCase()}<br><br>
            <b>Message</b>: <br> ${message}
            <br><br>
            <a href="mailto:${email}">Répondre</a>`;

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
            from_name: "No Reply - Press",
            subject: "[Contact] - nouvelle demande",
            html,
            to: recipients.map((recipient: string) => {
                return {
                    email: recipient,
                    type: "to",
                }
            }),
        }

        const response = await mailchimpTx.messages.send({ message: mail }) as mailchimp.MessagesSendResponse[];
        const confirm = await mailchimpTx.messages.send({
            message: {
                from_email: MAIL_FROM,
                from_name: t.get('page.form.mail-section.response.from-name'),
                subject: t.get('page.form.mail-section.response.subject'),
                html: `<p>${t.get('page.form.mail-section.response.content', { name })}</p><p><i>${t.get('page.form.mail-section.response.automatic-mail-disclaimer')}</i></p>`,
                to: [{
                    email: email as string,
                    type: "to",
                }]
            }
        }) as mailchimp.MessagesSendResponse[]

        if (response[0].status === 'sent' && confirm[0].status === 'sent') {
            return { message: "Mail sent." }
        }
        if (response[0].status === 'sent' && confirm[0].status !== 'sent') {
            return { partial: true, message: "Mail sent, but fails to sent to recipient..." }
        }

        return fail(500, { message: "Please retry later." })
    }
} satisfies Actions;