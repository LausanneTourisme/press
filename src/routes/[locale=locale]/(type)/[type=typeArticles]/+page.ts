import { error } from '@sveltejs/kit';

export const prerender = false;

export const config = {
  isr: {
    expiration: 86400
  }
};

export const load = () => {
  throw error(404);
};