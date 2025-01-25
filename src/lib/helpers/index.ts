/**
 * simple wrapper for scan.js to pick it up
 */
export const _ = (text: string): string => text;
export const blankable = (href: string | undefined): string | undefined => href && href.includes('http') ? '_blank' : undefined;

/**
 * get filename from a path
 */
export const filename = (path: string, withExtension: boolean = true): string => {
  const filename: string = <string>path.split('/').pop();

  if (withExtension) {
      return filename;
  }

  return <string>filename.split('.').shift();
}

export const getMediaLibraryRegisterLink = (locale: string|undefined|null): string => {
  let lang = 'lang=';

  switch (locale) {
      case 'fr':
          lang += 'fr_FR';
          break;
      case 'de':
          lang += 'de_DE';
          break;
      default :
          lang += 'en_US';
          break;
  }

  return `https://medialibrary.lausanne-tourisme.ch?registration&${lang}`;
}
