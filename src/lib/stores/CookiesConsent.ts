import { writable } from 'svelte/store';

type ConsentState = {
  [key in Category]?: boolean;
};

export const consentStore = writable<ConsentState>({});