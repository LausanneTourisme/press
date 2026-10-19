import { error } from '@sveltejs/kit';

export const prerender = false;

export const load = () => {
  throw error(404);
};
