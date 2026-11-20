import { page } from '$app/state';
import { RouteTypes } from '#lib/enums';
import { t } from '#lib/translations';
import { getFlash } from 'sveltekit-flash-message';

export const isOffline = () => typeof navigator !== 'undefined' && !navigator.onLine;

export const createFormNetowrkErrorFlash = () => {
  const flash = getFlash(page);

  return () => flash.set({ type: 'error', message: t.get(`${RouteTypes.Forms}.error-network`) });
};
