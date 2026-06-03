import { defaultLocale, locale } from '$lib/translations';
import type { MaybePromise } from '$types';
import type { RequestEvent, ResolveOptions } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import type { HandleServerError } from '@sveltejs/kit';

const resolveLanguage = async ({
  event,
  resolve
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent, opts?: ResolveOptions) => MaybePromise<Response>;
}) => {
  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Replace %lang% with the current locale
      const currentLocale = locale.get() ?? defaultLocale; // Get the current locale from the store
      return html.replace('%lang%', currentLocale);
    }
  });
};
export const handle = sequence(resolveLanguage);

export const handleError: HandleServerError = ({ error, event }) => {
  console.error(`[${new Date().toISOString()}] Unhandled error on ${event.request.method} ${event.url.pathname}`, error);
};
