import { Forms, getValues, RouteTypes, Themes } from '$enums';
import { menuItems } from '$lib/config/menu';
import { getPosts } from '$lib/services/requests.server';
import { defaultLocale, supportedLocales, type Locale } from '$lib/translations';
import type { Release, Translatable } from '$types';
import { route } from '.';

export type UrlEntry = {
  paths: Partial<Record<Locale, string>>;
  lastmod?: string;
};

export const getInternalLinks = async (params?: {
  canonLocale?: Locale;
  fetchFn?: typeof fetch;
}): Promise<UrlEntry[]> => {
  const entries: UrlEntry[] = [];

  entries.push({
    paths: Object.fromEntries(supportedLocales.map((l) => [l, `/${l}`])) as Record<Locale, string>
  });

  entries.push(...generateMenuEntries());
  entries.push(...generateThemeEntries());
  entries.push(...generateFormEntries());

  entries.push({
    paths: Object.fromEntries(
      supportedLocales.map((l) => [l, route(RouteTypes.Contact, { forceLocale: l })])
    ) as Record<Locale, string>
  });

  entries.push(...(await generatePresskitAndPressReleasesUrlSets(params?.fetchFn ?? fetch)));

  if (params && params.canonLocale) {
    return entries.filter((entry) => entry.paths[params.canonLocale!] !== undefined);
  }
  return entries;
};

const generateMenuEntries = (): UrlEntry[] => {
  const menus = Object.fromEntries(
    supportedLocales.map((locale) => [locale, menuItems(locale)])
  ) as Record<Locale, ReturnType<typeof menuItems>>;
  const entries: UrlEntry[] = [];

  menus[supportedLocales[0]].forEach((menu, menuIndex) => {
    if (menu.link) {
      entries.push({
        paths: Object.fromEntries(
          supportedLocales.map((locale) => [locale, menus[locale][menuIndex].link!])
        ) as Record<Locale, string>
      });
    } else if (menu.items) {
      menu.items.forEach((item, index) => {
        if (!item.link.startsWith('/')) return; // skip external links
        entries.push({
          paths: Object.fromEntries(
            supportedLocales.map((locale) => [locale, menus[locale][menuIndex].items![index].link])
          ) as Record<Locale, string>
        });
      });
    }
  });

  return entries;
};

const generateThemeEntries = (): UrlEntry[] => {
  return getValues(Themes).map((theme) => ({
    paths: Object.fromEntries(
      supportedLocales.map((locale) => [
        locale,
        route(RouteTypes.Themes, { forceLocale: locale, theme })
      ])
    ) as Record<Locale, string>
  }));
};

const generateFormEntries = (): UrlEntry[] => {
  return getValues(Forms).map((form) => ({
    paths: Object.fromEntries(
      supportedLocales.map((locale) => [
        locale,
        route(RouteTypes.Forms, { forceLocale: locale, form })
      ])
    ) as Record<Locale, string>
  }));
};

const generatePresskitAndPressReleasesUrlSets = async (
  fetchFn: typeof fetch
): Promise<UrlEntry[]> => {
  const releasesRes = await getPosts<Release<Translatable>>({ type: 'press_release', fetchFn });
  const releases = releasesRes.data?.items?.data ?? [];

  return releases.map((release) => {
    const routeType =
      release.type === 'press_kit' ? RouteTypes.Presskits : RouteTypes.Pressreleases;
    const paths: Partial<Record<Locale, string>> = {};

    for (const l of release.languages ?? []) {
      const locale = l as Locale;
      const slug = (release.seo?.slug as Translatable)?.[locale];
      if (slug) {
        paths[locale] = `${route(routeType, { forceLocale: locale })}/${slug}`;
      }
    }

    const rawDate = release.updated_at ?? release.published_at;
    let lastmod: string | undefined;
    if (rawDate) {
      const d = new Date(Number(rawDate) * 1000);
      if (!isNaN(d.getTime())) lastmod = d.toISOString().split('T')[0];
    }
    return { paths, lastmod };
  });
};

export const generateUrlSets = ({
  entries,
  urlOrigin,
  canonLocale
}: {
  entries: UrlEntry[];
  urlOrigin?: string;
  canonLocale?: Locale;
}): string[] => {
  const urlSets: string[] = [];
  entries.forEach(({ paths, lastmod }) => {
    if (canonLocale && !paths[canonLocale]) return; // skip entries that don't have the canonical locale

    const canonPath =
      (canonLocale && paths[canonLocale]) ??
      (paths[defaultLocale] ? paths[defaultLocale] : Object.values(paths)[0]!);
    const lastmodTag = lastmod ? `\n\t\t<lastmod>${lastmod}</lastmod>` : '';
    const alternates = Object.entries(paths)
      .map(
        ([locale, path]) =>
          `\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${urlOrigin ?? ''}${path}" />`
      )
      .join('\n');

    urlSets.push(
      `\t<url>\n\t\t<loc>${urlOrigin}${canonPath}</loc>${lastmodTag}\n${alternates}\n\t</url>`
    );
  });

  return urlSets;
};
