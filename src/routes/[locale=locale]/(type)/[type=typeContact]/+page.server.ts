import { RouteTypes } from "$enums";
import { MAIL_FROM } from "$env/static/private";
import { verifyIfHuman } from "$lib/helpers/index.server";
import { sendEmail } from "$lib/helpers/mails.server";
import { supportedLocales, t, translations } from "$lib/translations";
import { fail } from "@sveltejs/kit";
import type { Actions, EntryGenerator } from "./$types";


const validateEmail = (email: string | null | undefined) => {
    if (!email) return false;
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


        const errors: Record<string, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value?: any,
            incorrect: boolean,
            message: string,
        }> = {};

        if (!title) {
            errors.title = {
                value: title,
                incorrect: true,
                message: t.get(`${RouteTypes.Contact}.form.mail-section.validations.radio-buttons`),
            }
        }

        if (!name || (name && name.trim().length < nameMinimumCharacters)) {
            errors.name = {
                value: name,
                incorrect: true,
                message: t.get(`${RouteTypes.Contact}.form.mail-section.validations.text-length`, { number: nameMinimumCharacters }),
            }
        }

        if (!message || (message && message.trim().length < messageMinimumCharacters)) {
            errors.message = {
                value: message,
                incorrect: true,
                message: t.get(`${RouteTypes.Contact}.form.mail-section.validations.text-length`, { number: messageMinimumCharacters }),
            }
        }

        if (!job_title) {
            errors.job_title = {
                value: job_title,
                incorrect: true,
                message: t.get(`${RouteTypes.Contact}.form.mail-section.validations.select`),
            }
        }

        if (!validateEmail(email)) {
            errors.email = {
                value: email,
                incorrect: true,
                message: t.get(`${RouteTypes.Contact}.form.mail-section.validations.mail`),
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


        const { internal_reponse, external_response } = await sendEmail({
            intern_mail: {
                from_name: "No Reply - Press",
                subject: "[Contact] - nouvelle demande",
                html,
            },
            external_mail: {
                from_email: MAIL_FROM,
                from_name: t.get(`${RouteTypes.Contact}.form.mail-section.response.from-name`),
                subject: t.get(`${RouteTypes.Contact}.form.mail-section.response.subject`),
                html: `<p>${t.get(`${RouteTypes.Contact}.form.mail-section.response.content`, { name })}</p><p><i>${t.get(`${RouteTypes.Contact}.form.mail-section.response.automatic-mail-disclaimer`)}</i></p>`,
                to: [{
                    email: email as string,
                    type: "to",
                }]
            }
        });

        if (internal_reponse[0].status === 'sent' && external_response?.[0].status === 'sent') {
            return { message: "Mail sent." }
        }
        if (internal_reponse[0].status === 'sent' && external_response?.[0].status !== 'sent') {
            return { partial: true, message: "Mail sent, but fails to sent to recipient..." }
        }

        return fail(500, { message: "Please retry later." })
    }
} satisfies Actions;

export const entries: EntryGenerator = () => {
    const t = translations.get();

    return supportedLocales.flatMap(locale => {
        const type = t[locale][`route.${RouteTypes.Contact}.slug`];
        return {
            locale,
            type,
        };
    });
};