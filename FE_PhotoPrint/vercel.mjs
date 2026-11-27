const portal = process.env.VITE_PORTAL_ORIGIN?.trim();
const origin = portal ? new URL(portal) : null;
if (origin && (origin.protocol !== 'https:' || origin.origin !== portal)) {
  throw new Error('VITE_PORTAL_ORIGIN must be an HTTPS origin without a trailing slash.');
}

const appRoutes = '/((?!assets/|api/|t/[^/]+/api/).*)';
export const config = {
  headers: [{
    source: appRoutes,
    headers: [
      { key: 'Cache-Control', value: 'no-store, max-age=0' },
      { key: 'Content-Security-Policy', value: `frame-ancestors ${origin?.origin ?? "'none'"}` },
    ],
  }],
  rewrites: [{ source: appRoutes, destination: '/index.html' }],
};
