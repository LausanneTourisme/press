import { BOTPOISON_SKEY } from "$env/static/private";
import Botpoison from "@botpoison/node";
import { error } from "@sveltejs/kit";

export const verifyIfHuman = async (data: FormData) => {
    const botpoison = new Botpoison({
        secretKey: BOTPOISON_SKEY,
    });

    const _botpoison = data.get('_botpoison') as string | null;

    const { ok } = await botpoison.verify(_botpoison ?? '');

    if (!ok) {
        error(401, "No thank you, we don't like bots.");
    }
}