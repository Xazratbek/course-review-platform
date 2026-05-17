import React from 'react';

export function getHashPath() {
  const raw = window.location.hash || '#/';
  const path = raw.startsWith('#') ? raw.slice(1) : raw;
  return path.startsWith('/') ? path : `/${path}`;
}

export function navigate(to) {
  window.location.hash = to.startsWith('#') ? to : `#${to}`;
}

export function matchPath(pathname, pattern) {
  // pattern example: /category/:slug
  const pSeg = pattern.split('/').filter(Boolean);
  const aSeg = pathname.split('/').filter(Boolean);
  if (pSeg.length !== aSeg.length) return null;

  const params = {};
  for (let i = 0; i < pSeg.length; i += 1) {
    const p = pSeg[i];
    const a = aSeg[i];
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(a);
    else if (p !== a) return null;
  }
  return params;
}

export function useHashRoute(routeDefs) {
  const [, force] = React.useState(0);

  React.useEffect(() => {
    const onHash = () => force((x) => x + 1);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const pathname = getHashPath();

  for (const def of routeDefs) {
    const params = matchPath(pathname, def.pattern);
    if (params) return { component: def.component, params };
  }

  return routeDefs[0] ? { component: routeDefs[0].component, params: {} } : { component: null, params: {} };
}
