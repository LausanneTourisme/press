import { error } from '@sveltejs/kit';

export const prerender = false;

export const config = {
  isr: {
    expiration: 31536000
  }
};

export const load = ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'public, s-maxage=31536000, immutable' });
  throw error(404);
};
