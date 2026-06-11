import { version } from '$app/environment';
import type { RequestHandler } from '@sveltejs/kit';
import { generateUrlSets, getInternalLinks } from '$lib/helpers/sitemap';

export const GET: RequestHandler = async ({ url, fetch }) => {
  const entries = await getInternalLinks({ fetchFn: fetch });
  const urlSets = generateUrlSets({ entries, urlOrigin: url.origin });

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
