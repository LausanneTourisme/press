import { env } from '$env/dynamic/private';
import Botpoison from '@botpoison/node';
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { isOfflineMode } from '$lib/helpers';

export const isCRMEnabled = env.ENABLE_CRM === 'true';

export const verifyIfHuman = async (data: FormData) => {
  if (dev && isOfflineMode) return;

  const botpoison = new Botpoison({
    secretKey: env.BOTPOISON_SKEY
  });

  const _botpoison = data.get('_botpoison') as string | null;

  const { ok } = await botpoison.verify(_botpoison ?? '');

  if (!ok) {
    error(401, "No thank you, we don't like bots.");
  }
};
