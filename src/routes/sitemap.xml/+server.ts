import { RouteTypes, Themes } from "$enums";
import { getMediaLibraryRegisterLink, route } from "$lib/helpers";
import { menuItems } from "$lib/helpers/menu";
import { getPosts } from "$lib/helpers/requests.server";
import { defaultLocale, type Locale, supportedLocales, translations } from "$lib/translations";
import type { Release, Translatable } from "$types";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
  const urlSets = await Promise.all([generateUrlSets(url.origin), generatePresskitAndPressReleasesUrlSets(url.origin)]);

  return new Response(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlSets.flat().join('\n')}\n</urlset>`, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

const generateUrlSets = async (urlOrigin: string) => {
  const urlSets: string[] = [generateAlternateUrlBlocks(urlOrigin, supportedLocales.map(x => `/${x}`))];
  const links = new Map<Locale, Map<string, string>>();

  supportedLocales.forEach((locale) => {
    links.set(locale, getLinksByLocale(locale));
  });

  const keys = Array.from(links.get(defaultLocale)!.keys()).map(x => x.substring(3));

  keys.forEach((key) => {
    const alternates: string[] = [];
    supportedLocales.forEach((locale) => {
      alternates.push(links.get(locale)!.get(`${locale}.${key}`)!)
    });
    urlSets.push(generateAlternateUrlBlocks(urlOrigin, alternates));
  });

  return urlSets;
}

const getLinksByLocale = (locale: Locale) => {
  const list = menuItems(locale);
  const links = new Map<string, string>();

  list.forEach((menu, menuIndex) => {
    if (menu.link) {
      links.set(`${locale}.${menuIndex}`, menu.link);
    }
    if (menu.items) {
      menu.items.forEach((menuItem, menuItemIndex) => {
        if (menuItem.link === getMediaLibraryRegisterLink(locale)) return;

        links.set(`${locale}.${menuIndex}.${menuItemIndex}`, menuItem.link);
      })
    }
  });

  return links;
}

const generateAlternateUrlBlocks = (urlOrigin: string, paths: string[]) => {
  return paths
    .map((locUrl) => {
      const alternates = paths
        .map((alternateUrl) => {
          const locale = alternateUrl.split("/")[1]; // extract 'fr', 'de', etc.
          return `\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${urlOrigin}${alternateUrl}" />`;
        })
        .join("\n");

      return `\t<url>\n\t\t<loc>${urlOrigin}${locUrl}</loc>\n${alternates}\n\t</url>`;
    })
    .join("\n");
}

const generatePresskitAndPressReleasesUrlSets = async (urlOrigin: string) => {
  const slugsAlreadyCreated: string[] = [];
  const urlSets: string[] = [];

  const releasesRes = await getPosts<Release<Translatable>>({ type: 'press_release' });
  const releases = releasesRes.data?.items?.data ?? [];

  for (const release of releases) {
    const languages = release.languages!;
    const seo = release.seo!;
    const type = release.type === 'press_kit' ? RouteTypes.Presskit : RouteTypes.Pressrelease;
    const alternates: string[] = [];

    languages.forEach((l) => {
      const slug = seo.slug![l as Locale]!;
      if (slugsAlreadyCreated.includes(slug)) return;

      slugsAlreadyCreated.push(slug);
      alternates.push(`/${l}/${translations.get()[l][`route.${type}.slug`]}/${slug}`)
    });
    urlSets.push(generateAlternateUrlBlocks(urlOrigin, alternates));
  }

  return urlSets;
}
