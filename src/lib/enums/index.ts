export type RouteType = typeof RouteTypes[keyof typeof RouteTypes]
export type Theme = typeof Themes[keyof typeof Themes]

export const RouteTypes = {
  Home: "home",
  Articles: "articles",
  Contact: "contact",
  Coverage: "coverage",
  Highlights: "highlights",
  Themes: 'themes',
  Pressrelease: "press-release",
  Presskit: "press-kit",
} as const;

export const Themes = {
  Nature: 'nature',
  Education: 'education',
  Culture: 'culture',
  Gastronomy: 'gastronomy',
  Sustainability: 'sustainability',
  Family: 'family',
  Architecture: 'architecture',
  Lacustrine: 'lacustrine',
  Wellness: 'wellness',
  Unusual: 'unusual',
  Sport: 'sport',
} as const;