import { defineParams } from '@sveltejs/kit/params';
import { Forms, RouteTypes, Themes } from '#lib/enums';
import type { Locale } from '#lib/translations';
import routeDe from '#lib/translations/de/route.json' with { type: 'json' };
import routeEn from '#lib/translations/en/route.json' with { type: 'json' };
import routeFr from '#lib/translations/fr/route.json' with { type: 'json' };

// Loaded by plain Node at build time: keep imports free of Vite-only modules.
const routes: Record<Locale, Record<string, string>> = { fr: routeFr, en: routeEn, de: routeDe };
const supportedLocales = Object.keys(routes) as Locale[];

const matchFormContentCreator = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Forms}.${Forms.ContentCreator}.slug`])
    .includes(param);
};

const matchFormJournalist = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Forms}.${Forms.Journalist}.slug`])
    .includes(param);
};

const matchFormMediaCoverage = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Forms}.${Forms.MediaCoverage}.slug`])
    .includes(param);
};

const matchFormThanks = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Forms}.${Forms.Thanks}.slug`])
    .includes(param);
};

const matchLocale = (param: string): param is Locale => {
  return supportedLocales.includes(param.toLowerCase() as Locale);
};

const matchThemes = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => Object.values(Themes).map((theme) => routes[lang][`themes.${theme}.slug`]))
    .includes(param);
};

const matchTypeArticles = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Articles}.slug`])
    .includes(param);
};

const matchTypeContact = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Contact}.slug`])
    .includes(param);
};

const matchTypeCoverage = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Coverages}.slug`])
    .includes(param);
};

const matchTypeForm = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Forms}.slug`])
    .includes(param);
};

const matchTypeHighlights = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Highlights}.slug`])
    .includes(param);
};

const matchTypePress = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => [
      routes[lang][`${RouteTypes.Presskits}.slug`],
      routes[lang][`${RouteTypes.Pressreleases}.slug`]
    ])
    .includes(param);
};

const matchTypePressreleasesAndPresskit = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.PressreleasesAndPresskits}.slug`])
    .includes(param);
};

const matchTypeThemes = (param: string): boolean => {
  return supportedLocales
    .flatMap((lang) => routes[lang][`${RouteTypes.Themes}.slug`])
    .includes(param);
};

export const params = defineParams({
  formContentCreator: (param) => (matchFormContentCreator(param) ? param : undefined),
  formJournalist: (param) => (matchFormJournalist(param) ? param : undefined),
  formMediaCoverage: (param) => (matchFormMediaCoverage(param) ? param : undefined),
  formThanks: (param) => (matchFormThanks(param) ? param : undefined),
  locale: (param) => (matchLocale(param) ? param : undefined),
  themes: (param) => (matchThemes(param) ? param : undefined),
  typeArticles: (param) => (matchTypeArticles(param) ? param : undefined),
  typeContact: (param) => (matchTypeContact(param) ? param : undefined),
  typeCoverage: (param) => (matchTypeCoverage(param) ? param : undefined),
  typeForm: (param) => (matchTypeForm(param) ? param : undefined),
  typeHighlights: (param) => (matchTypeHighlights(param) ? param : undefined),
  typePress: (param) => (matchTypePress(param) ? param : undefined),
  typePressreleasesAndPresskit: (param) => (matchTypePressreleasesAndPresskit(param) ? param : undefined),
  typeThemes: (param) => (matchTypeThemes(param) ? param : undefined)
});
