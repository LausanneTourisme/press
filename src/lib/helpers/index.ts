import { RouteTypes, type RouteType, type Theme } from "$enums";
import { PUBLIC_ENABLE_OFFLINE_MODE } from "$env/static/public";
import { defaultLocale, locale, t, type Locale } from "$lib/translations";
import type { PostType, Translatable } from '$lib/types';

export const isOfflineMode = PUBLIC_ENABLE_OFFLINE_MODE === "true"
export const maxMobileWidth = 1280;
export const blankable = (href: string | undefined): string | undefined => href && href.includes('http') ? '_blank' : undefined;

/**
 * get filename from a path
 */
export const filename = (path: string, withExtension: boolean = true): string => {
  let filename: string;

  if (path.startsWith('/')) {
    filename = path.substring(1)
  }

  filename = <string>path.split('/').pop();

  if (withExtension) {
    return filename;
  }

  return <string>filename.split('.').shift();
}

export const getMediaLibraryRegisterLink = (locale: Locale): string => {
  let lang = 'lang=';

  switch (locale) {
    case 'fr':
      lang += 'fr_FR';
      break;
    case 'de':
      lang += 'de_DE';
      break;
    default:
      lang += 'en_US';
      break;
  }

  return `https://medialibrary.lausanne-tourisme.ch?registration&${lang}`;
}

export const route = (type: RouteType, options: { forceLocale?: Locale | undefined, theme?: Theme, suffix?: string } = { forceLocale: undefined, theme: undefined }): string => {
  const lang = options.forceLocale ?? locale.get() as Locale ?? defaultLocale;
  const slug: string | undefined = t.get(`route.${type}.slug`);

  if (!slug) return `/${lang}`;

  if (type === RouteTypes.Themes) {
    const theme = options.theme;
    const themeSlug = theme ? t.get(`route.${RouteTypes.Themes}.${theme}.slug`) : null;

    if (!themeSlug) return `/${lang}/${slug}`;
    return `/${lang}/${slug}/${themeSlug}/`;
  }


  if (!slug) return `/${lang}`;
  if (options.suffix) return `/${lang}/${slug}/${options.suffix}`;
  return `/${lang}/${slug}`;
}

/**
 * Split `data` into small chunks
 * @param data Your data to split
 * @param itemsPerChunk how many items per chunk
 * @returns an array with your data splited
 */
export function chunkify<T>(data: T[], itemsPerChunk: number = 4): T[][] {
  return data.reduce((result: T[][], item, index) => {
    const chunkIndex = Math.floor(index / itemsPerChunk);

    // Ensure the chunk array exists
    if (!result[chunkIndex]) {
      result[chunkIndex] = [];
    }

    result[chunkIndex].push(item);

    return result;
  }, []);
}

export function ucfirst(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function intersect<Type>(a: Type[], b: Type[]): Type[] {
  return a.filter(Set.prototype.has, new Set(b));
}

export function normalize(string: string): string {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const filterByTag = <T extends PostType<Translatable | string>>(data: T[], tags: string | string[]) => {

  if (typeof tags === 'string') {
    tags = [tags] // Will convert to array anyway
  }

  return data.filter((post: T) => {
    if (!post?.tags?.length) {
      return false;
    }
    return tags.some(tag => post.tags?.map(x => x.name).includes(tag))
  })
    .sort((a: T, b: T): number => {
      if ((Number)(a.published_at) < (Number)(b.published_at)) return 1;
      if ((Number)(a.published_at) > (Number)(b.published_at)) return -1;
      return 0;
    });
};

export function getTailwindColor(tailwindClass: string) {
  const element = document.createElement('div');
  element.className = tailwindClass;
  document.body.appendChild(element);

  const color = getComputedStyle(element).backgroundColor;
  document.body.removeChild(element);
  return color;
}