import { error } from '@sveltejs/kit';

export const prerender = true;

export const load = () => {
  throw error(404);
};
