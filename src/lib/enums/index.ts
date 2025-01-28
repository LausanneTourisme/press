export type RouteType = typeof RouteTypes[keyof typeof RouteTypes]

export const RouteTypes = {
  Home: "home",
  Contact: "contact",
  Articles: "articles",
  Themes: 'themes',
  Coverage: "coverage",
  Pressrelease: "press-release",
  Presskit: "press-kit",
  Highlights: "highlights",
} as const;
