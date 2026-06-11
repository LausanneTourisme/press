import { version } from '$app/environment';
import { getInternalLinks, generateUrlSets } from '$lib/helpers/sitemap';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, fetch, params }) => {
  const entries = await getInternalLinks({ fetchFn: fetch, canonLocale: params.locale });
  const urlSets = generateUrlSets({ entries, urlOrigin: url.origin, canonLocale: params.locale });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<?xml-stylesheet type="text/css" href="/sitemap.css?v=${encodeURIComponent(version)}"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlSets.join('\n')}\n</urlset>`,
    {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-transform'
      }
    }
  );
};
