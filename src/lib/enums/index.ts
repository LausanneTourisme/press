export type RouteType = typeof RouteTypes[keyof typeof RouteTypes]
export type Theme = typeof Themes[keyof typeof Themes]

//ThemeKeys available under 😉 needs reference of Themes

export const RouteTypes = {
  Home: "home",
  Articles: "articles",
  Contact: "contact",
  Coverage: "coverage",
  Highlights: "highlights",
  Themes: 'themes',
  Pressrelease: "press-release",
  Presskit: "press-kit",
  PressreleasesAndPresskits: "press-releases-and-press-kits"
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
  Unusual: 'unusual',
} as const;

// Manually create reverse mapping: (because TS enum isn't really good)
export const ThemeKeys = Object.fromEntries(
  Object.entries(Themes).map(([key, value]) => [value, key])
) as Record<Theme, keyof typeof Themes>;
