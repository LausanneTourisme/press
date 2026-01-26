import { error } from '@sveltejs/kit';

export const prerender = false;

export const config = {
  isr: {
    expiration: 31536000
  }
};

export const load = () => {
  throw error(404);
};
