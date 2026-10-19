// Cloudflare is the only cache layer so a purge there is effective; Vercel ignores this header.
export const edgeCache = (seconds: number) => ({
  'cache-control': 'public, max-age=0, must-revalidate',
  'cloudflare-cdn-cache-control': `public, max-age=${seconds}, stale-while-revalidate=3600`
});
