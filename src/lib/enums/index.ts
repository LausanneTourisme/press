export type RouteType = (typeof RouteTypes)[keyof typeof RouteTypes];
export type Theme = (typeof Themes)[keyof typeof Themes];
export type Form = (typeof Forms)[keyof typeof Forms];
export type MediaType = (typeof MediaTypes)[keyof typeof MediaTypes];
export type TravelReduction = (typeof TravelReductions)[keyof typeof TravelReductions];
export type Title = (typeof Titles)[keyof typeof Titles];
export type SocialNetwork = (typeof SocialNetworks)[keyof typeof SocialNetworks];

//ThemeKeys available under 😉 needs reference of Themes

export const RouteTypes = {
  Home: 'home',
  Articles: 'articles',
  Contact: 'contact',
  Coverages: 'coverages',
  Highlights: 'highlights',
  Themes: 'themes',
  Pressreleases: 'press-releases',
  Presskits: 'press-kits',
  PressreleasesAndPresskits: 'press-releases-and-press-kits',
  Forms: 'forms'
} as const;

export const Themes = {
  Culture: 'culture',
  Nature: 'nature',
  Sport: 'sport',
  Gastronomy: 'gastronomy',
  Education: 'education',
  Sustainability: 'sustainability',
  Family: 'family',
  Architecture: 'architecture',
  Lacustrine: 'lacustrine',
  Wellness: 'wellness',
  Unusual: 'unusual'
} as const;

export const Forms = {
  Journalist: 'journalist',
  ContentCreator: 'content-creator',
  MediaCoverage: 'media-coverage',
  Thanks: 'thanks'
} as const;

export const MediaTypes = {
  Print: 'print',
  Online: 'online',
  Tv: 'tv',
  Radio: 'radio'
} as const;

export const TravelReductions = {
  PointToPointTravelcard: 'point-to-point-travelcard',
  HalfFare: 'half-fare',
  SwissGATravelCard: 'swiss-ga-travelcard'
} as const;

export const Titles = {
  Mrs: 'mrs',
  Mr: 'mr',
  They: 'they'
} as const;

export const SocialNetworks = {
  Instagram: 'instagram',
  TikTok: 'tiktok',
  YouTube: 'youtube',
  Blog: 'blog'
} as const;

// generic helper
function invert<T extends Record<string, string>>(obj: T) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k])) as {
    [K in keyof T as T[K]]: K;
  };
}

export function getValues<T extends Record<string, string>>(obj: T) {
  return Object.values(obj) as [(typeof obj)[keyof T]];
}

// usage
export const ThemeKeys = invert(Themes);
export const FormsKeys = invert(Forms);
export const MediaTypesKeys = invert(MediaTypes);
export const TravelReductionsKeys = invert(TravelReductions);
export const TitlesKeys = invert(Titles);
export const SocialNetworksKeys = invert(SocialNetworks);
