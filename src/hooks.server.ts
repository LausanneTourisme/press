import type { RequestEvent } from '@sveltejs/kit';
import { NOINDEX } from '$app/env/private';
import { defaultLocale, locale } from '#lib/translations';
import type { MaybePromise } from '#lib/types';
import {
  sequence,
  type Handle,
  type ResolveOptions,
  type HandleServerError
} from '@sveltejs/kit/hooks';

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
const ROBOTS = 'noindex, nofollow';

// Prerendered pages are served as static files without hooks, so they need the meta tag too.
const noIndex: Handle = async ({ event, resolve }) => {
  const response = await resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace(
        '%robots%',
        `<meta name="robots" content="${NOINDEX ? ROBOTS : 'index,follow'}" />`
      )
  });
  if (NOINDEX) response.headers.set('X-Robots-Tag', ROBOTS);
  return response;
};

export const handle = sequence(noIndex, resolveLanguage);

export const handleError: HandleServerError = ({ kind, error, event }) => {
  if (kind !== 'unknown') return;

  console.error(
    `[${new Date().toISOString()}] Unhandled error on ${event.request.method} ${event.url.pathname}`,
    error
  );
};
