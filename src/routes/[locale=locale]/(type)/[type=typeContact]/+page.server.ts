import { BOTPOISON_SKEY, MAIL_DEFAULT_RECIPIENTS, MAIL_TO } from "$env/static/private";
import { t } from "$lib/translations";
import Botpoison from "@botpoison/node";
import { error, fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

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

        if (name && name.trim().length < nameMinimumCharacters) {
            errors.name = {
                value: name,
                incorrect: true,
                message: t.get("page.form.mail-section.validations.text-length", { number: nameMinimumCharacters }),
            }
        }

        if (message && message.trim().length < messageMinimumCharacters) {
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

        //TODO check email

        if (Object.keys(errors).length > 0) {
            return fail(400, { fields: errors })
        }

        const html = `De <b>${title}</b> ${name}<br>
            <b>Profession</b>: ${job_title}<br><br>
            <b>Email</b>: <a href="mailto:${email}">${email}</a><br>
            <b>Langue du navigateur</b>: ${params.locale.toUpperCase()}<br><br>
            <b>Message</b>: <br> ${message}
            <br><br>
            <a href="mailto:${email}">Répondre</a>`;
        return { status: 204 }
    }
} satisfies Actions;