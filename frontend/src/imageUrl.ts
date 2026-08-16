const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

function siteOrigin(): string {
  const fromEnv = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://gindeberetconstruction.com';
}

/** True when URL/path points at frontend static assets (not API uploads). */
function isSiteStaticPath(pathname: string): boolean {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/promo/') ||
    pathname.startsWith('/logo') ||
    pathname === '/logo.png' ||
    pathname.startsWith('/favicon')
  );
}

/**
 * Normalize stored image paths for display.
 * - /images/* and site assets → always from the public website origin
 * - /uploads/* → API / backend origin
 * - Full http(s) URLs kept, except api-host + /images rewritten to the site
 */
export function getImageUrl(imagePath: string) {
  if (!imagePath || !String(imagePath).trim()) {
    return 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  }

  const raw = String(imagePath).trim();
  const site = siteOrigin();

  if (raw.startsWith('blob:') || raw.startsWith('data:')) {
    return raw;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (isSiteStaticPath(parsed.pathname)) {
        return `${site}${parsed.pathname}`;
      }
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${BACKEND_BASE_URL}${parsed.pathname}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  const path = raw.startsWith('/') ? raw : `/${raw}`;

  if (isSiteStaticPath(path)) {
    return `${site}${path}`;
  }

  if (path.startsWith('/uploads/')) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  return `${BACKEND_BASE_URL}${path}`;
}

/** Prefer storing site-relative /images or /uploads paths in the DB. */
export function normalizeStoredImagePath(imagePath: string): string {
  if (!imagePath || !String(imagePath).trim()) return '';
  const raw = String(imagePath).trim();
  if (raw.startsWith('blob:') || raw.startsWith('data:')) return raw;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const parsed = new URL(raw);
      if (isSiteStaticPath(parsed.pathname) || parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
      return raw;
    }
  } catch {
    return raw;
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}
