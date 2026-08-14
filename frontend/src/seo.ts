import { OFFICE } from './contactLocation';

/** Production site origin — set VITE_SITE_URL when you deploy (no trailing slash). */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://gindeberetconstruction.com')
).replace(/\/$/, '');

export const SITE_NAME = 'Gindeberet General Construction PLC';
export const DEFAULT_OG_IMAGE = '/logo.png';

const DEFAULT_KEYWORDS = [
  'construction company in Ethiopia',
  'construction company in Addis Ababa',
  'construction PLC Ethiopia',
  'construction company PLC',
  'general construction Ethiopia',
  'big construction company Ethiopia',
  'road construction Ethiopia',
  'building contractor Addis Ababa',
  'Gindeberet General Construction',
  'Gindeberet Construction PLC',
].join(', ');

const DEFAULT_DESCRIPTION =
  'Gindeberet General Construction PLC — a trusted construction company in Ethiopia and Addis Ababa. Roads, buildings, water works, and electro-mechanical projects delivered with quality, safety, and on-time performance since 2012.';

type SeoPage = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  noindex?: boolean;
};

const PAGES: Record<string, SeoPage> = {
  '/': {
    path: '/',
    title: `${SITE_NAME} | Construction Company in Ethiopia & Addis Ababa`,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  '/about': {
    path: '/about',
    title: `About Us | ${SITE_NAME}`,
    description:
      'Learn about Gindeberet General Construction PLC: established 2012, delivering civil construction, roads, buildings, and water works across Ethiopia from Addis Ababa.',
  },
  '/services': {
    path: '/services',
    title: `Services | ${SITE_NAME}`,
    description:
      'Professional construction services in Ethiopia: road construction, buildings, water works, corridors, and electro-mechanical packages from Gindeberet General Construction PLC.',
  },
  '/portfolio': {
    path: '/portfolio',
    title: `Projects | ${SITE_NAME}`,
    description:
      'Browse completed and ongoing construction projects by Gindeberet General Construction PLC across Ethiopia — roads, buildings, health facilities, and more.',
  },
  '/contact': {
    path: '/contact',
    title: `Contact | ${SITE_NAME}`,
    description:
      'Contact Gindeberet General Construction PLC in Addis Ababa (Global Hotel Lancha). Call or email for construction tenders, partnerships, and project enquiries.',
  },
  '/careers': {
    path: '/careers',
    title: `Careers | ${SITE_NAME}`,
    description:
      'Join Gindeberet General Construction PLC — construction careers and vacancies in Ethiopia for engineers, site teams, and support staff.',
  },
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function resolvePage(pathname: string): SeoPage {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (PAGES[path]) return PAGES[path];

  if (path.startsWith('/services/')) {
    const slug = path.split('/')[2] || '';
    const label = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      path,
      title: `${label} | ${SITE_NAME}`,
      description: `${label} services by Gindeberet General Construction PLC — a construction company in Ethiopia and Addis Ababa delivering quality civil works.`,
    };
  }

  if (
    path.startsWith('/admin') ||
    path.startsWith('/projects') ||
    path.startsWith('/settings') ||
    path.startsWith('/vacancies') ||
    path.startsWith('/stamp-sign') ||
    path.startsWith('/auth') ||
    path.startsWith('/forgot') ||
    path.startsWith('/new-password')
  ) {
    return {
      path,
      title: `Admin | ${SITE_NAME}`,
      description: 'Private administration area.',
      noindex: true,
    };
  }

  return {
    path,
    title: PAGES['/'].title,
    description: PAGES['/'].description,
    keywords: DEFAULT_KEYWORDS,
  };
}

/** Apply document title, meta tags, canonical, and Organization/LocalBusiness JSON-LD. */
export function applySeo(pathname: string) {
  if (typeof document === 'undefined') return;

  const page = resolvePage(pathname);
  const origin =
    (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ||
    window.location.origin;
  const url = `${origin}${page.path === '/' ? '/' : page.path}`;
  const image = `${origin}${DEFAULT_OG_IMAGE}`;

  document.title = page.title;

  upsertMeta('name', 'description', page.description);
  upsertMeta('name', 'keywords', page.keywords || DEFAULT_KEYWORDS);
  upsertMeta('name', 'author', SITE_NAME);
  upsertMeta('name', 'robots', page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  upsertMeta('name', 'geo.region', 'ET-AA');
  upsertMeta('name', 'geo.placename', 'Addis Ababa, Ethiopia');
  upsertMeta('name', 'geo.position', `${OFFICE.lat};${OFFICE.lng}`);
  upsertMeta('name', 'ICBM', `${OFFICE.lat}, ${OFFICE.lng}`);

  upsertMeta('property', 'og:type', page.path === '/' ? 'website' : 'article');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', page.title);
  upsertMeta('property', 'og:description', page.description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:locale', 'en_ET');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', page.title);
  upsertMeta('name', 'twitter:description', page.description);
  upsertMeta('name', 'twitter:image', image);

  upsertLink('canonical', url);

  upsertJsonLd('seo-org-jsonld', {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'GeneralContractor'],
    '@id': `${origin}/#organization`,
    name: SITE_NAME,
    alternateName: [
      'Gindeberet Construction',
      'Gindeberet General Construction',
      'Gindeberet Construction PLC',
    ],
    url: origin,
    logo: image,
    image,
    description: DEFAULT_DESCRIPTION,
    foundingDate: '2012',
    telephone: ['+251911908456', '+251917000912'],
    email: 'gindeberetconstruction2772@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Global Hotel Lancha',
      addressLocality: 'Addis Ababa',
      addressCountry: 'ET',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: OFFICE.lat,
      longitude: OFFICE.lng,
    },
    areaServed: [
      { '@type': 'Country', name: 'Ethiopia' },
      { '@type': 'City', name: 'Addis Ababa' },
    ],
    knowsAbout: [
      'Construction company in Ethiopia',
      'Construction PLC',
      'Road construction',
      'Building construction',
      'Water works',
      'Electro-mechanical works',
    ],
    sameAs: [],
  });

  upsertJsonLd('seo-website-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    url: origin,
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@id': `${origin}/#organization` },
    inLanguage: ['en', 'om', 'am'],
  });
}
