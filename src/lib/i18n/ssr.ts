import { supportedLocales } from '$lib/i18n/index';
import type { Locale } from '$types/I18n';

interface Transform {
  [key: string]: string;
}

export const t = async (message: string, forcedLocale: Locale, transform: Transform = {}): Promise<string> => {
  if (forcedLocale) {
    if (supportedLocales.includes(forcedLocale)) {
      const file = await import(`$lib/${forcedLocale}.json`);
      message = file.default[message] ?? message;
      return message.replace(/{(\w+?)}/g, (capture, value) => transform[value] ?? '');
    }
  }
  return message.replace(/{(\w+?)}/g, (capture, value) => transform[value] ?? '');
};