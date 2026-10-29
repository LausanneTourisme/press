import type { RequestEvent } from '@sveltejs/kit';
import { defaultLocale, locale } from '#lib/translations';
import type { MaybePromise } from '#lib/types';
import { sequence, type ResolveOptions, type HandleServerError } from '@sveltejs/kit/hooks';

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

export const handleError: HandleServerError = ({ kind, error, event }) => {
  if (kind !== 'unknown') return;

  console.error(
    `[${new Date().toISOString()}] Unhandled error on ${event.request.method} ${event.url.pathname}`,
    error
  );
};
