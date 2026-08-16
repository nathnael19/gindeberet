import { OFFICE } from './contactLocation';
import { SERVICES } from './servicesData';

/** Production site origin — set VITE_SITE_URL when you deploy (no trailing slash). */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://gindeberetconstruction.com')
).replace(/\/$/, '');

export const SITE_NAME = 'Gindeberet General Construction PLC';
export const DEFAULT_OG_IMAGE = '/logo.png';

const DEFAULT_KEYWORDS = [
  'Gindeberet General Construction PLC',
  'Gindeberet Construction',
  'construction company in Ethiopia',
  'construction company Ethiopia',
  'construction company in Addis Ababa',
  'construction company Addis Ababa',
  'construction company in Oromia',
  'construction PLC Ethiopia',
  'general construction Ethiopia',
  'general contractor Ethiopia',
  'building contractor Addis Ababa',
  'building contractor Oromia',
  'road construction Ethiopia',
  'road construction Addis Ababa',
  'road construction Oromia',
  'building construction Ethiopia',
  'water works Ethiopia',
  'water supply construction Ethiopia',
  'corridor construction Ethiopia',
  'electro mechanical construction Ethiopia',
  'machinery rental construction Ethiopia',
  'civil engineering contractor Ethiopia',
  'infrastructure contractor Oromia',
  'construction company PLC',
  'big construction company Ethiopia',
].join(', ');

const DEFAULT_DESCRIPTION =
  'Gindeberet General Construction PLC — trusted construction company in Ethiopia, Oromia, and Addis Ababa. Road construction, building construction, water works, corridors, electro-mechanical packages, and machinery rental since 2012.';

const SERVICE_SEO: Record<
  string,
  { title: string; description: string; keywords: string }
> = {
  'road-construction': {
    title: `Road Construction Ethiopia & Oromia | ${SITE_NAME}`,
    description:
      'Road construction company in Ethiopia, Oromia, and Addis Ababa — urban and rural roads, paving, drainage, and rehabilitation by Gindeberet General Construction PLC.',
    keywords:
      'road construction Ethiopia, road construction Oromia, road construction Addis Ababa, gravel road contractor Ethiopia, asphalt paving Ethiopia, Gindeberet road construction',
  },
  'building-construction': {
    title: `Building Construction Ethiopia & Addis Ababa | ${SITE_NAME}`,
    description:
      'Building construction contractor in Addis Ababa, Oromia, and Ethiopia — offices, schools, health facilities, and commercial buildings by Gindeberet General Construction PLC.',
    keywords:
      'building construction Ethiopia, building contractor Addis Ababa, building contractor Oromia, commercial construction Ethiopia, Gindeberet building construction',
  },
  'water-works': {
    title: `Water Works & Supply Construction Ethiopia | ${SITE_NAME}`,
    description:
      'Water works and water supply construction in Ethiopia and Oromia — treatment plants, pipelines, and sanitation packages by Gindeberet General Construction PLC.',
    keywords:
      'water works Ethiopia, water supply construction Oromia, water treatment plant Ethiopia, pipeline contractor Addis Ababa, Gindeberet water works',
  },
  corridors: {
    title: `Corridor Construction Ethiopia & Addis Ababa | ${SITE_NAME}`,
    description:
      'Urban and roadside corridor construction in Addis Ababa, Shaggar, and across Ethiopia — LOT packages delivered by Gindeberet General Construction PLC.',
    keywords:
      'corridor construction Ethiopia, roadside corridor Addis Ababa, urban corridor Oromia, Shaggar corridor contractor, Gindeberet corridors',
  },
  'electro-mechanical': {
    title: `Electro-Mechanical Construction Ethiopia | ${SITE_NAME}`,
    description:
      'Electro-mechanical construction works in Ethiopia and Oromia — wood, metal, furniture, and MEP packages by Gindeberet General Construction PLC.',
    keywords:
      'electro mechanical Ethiopia, MEP contractor Addis Ababa, electro mechanical Oromia, furniture installation construction Ethiopia, Gindeberet electro-mechanical',
  },
  'machinery-rental': {
    title: `Construction Machinery Rental Ethiopia | ${SITE_NAME}`,
    description:
      'Construction machinery rental in Addis Ababa, Oromia, and Ethiopia — equipment on demand for active sites from Gindeberet General Construction PLC.',
    keywords:
      'machinery rental Ethiopia, construction equipment rental Addis Ababa, plant hire Oromia, construction machinery Ethiopia, Gindeberet machinery rental',
  },
};

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
    title: `${SITE_NAME} | Construction Company Ethiopia, Oromia & Addis Ababa`,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
  },
  '/about': {
    path: '/about',
    title: `About Us | Construction Company Ethiopia & Addis Ababa | ${SITE_NAME}`,
    description:
      'About Gindeberet General Construction PLC — established 2012 in Ethiopia. Civil construction, roads, buildings, and water works across Oromia and Addis Ababa.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/services': {
    path: '/services',
    title: `Construction Services Ethiopia | Roads, Buildings, Water | ${SITE_NAME}`,
    description:
      'Full construction services in Ethiopia, Oromia, and Addis Ababa: road construction, building construction, water works, corridors, electro-mechanical, and machinery rental.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/portfolio': {
    path: '/portfolio',
    title: `Projects in Ethiopia & Oromia | ${SITE_NAME}`,
    description:
      'Construction projects by Gindeberet General Construction PLC across Ethiopia and Oromia — roads, corridors, buildings, health facilities, bridges, and water works.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/company-profile': {
    path: '/company-profile',
    title: `Company Project Profile | ${SITE_NAME}`,
    description:
      'Gindeberet General Construction PLC company project profile — contract history, amounts, periods, and progress across Ethiopia and Oromia. Download as PDF.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/contact': {
    path: '/contact',
    title: `Contact Construction Company Addis Ababa | ${SITE_NAME}`,
    description:
      'Contact Gindeberet General Construction PLC in Addis Ababa (Global Hotel Lancha). Enquiries for construction in Ethiopia and Oromia — tenders, partnerships, and projects.',
    keywords: DEFAULT_KEYWORDS,
  },
  '/careers': {
    path: '/careers',
    title: `Careers | Construction Jobs Ethiopia | ${SITE_NAME}`,
    description:
      'Construction careers at Gindeberet General Construction PLC in Ethiopia — engineering, site, and support roles in Addis Ababa and Oromia.',
    keywords: DEFAULT_KEYWORDS,
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

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    if (hreflang) el.hreflang = hreflang;
    document.head.appendChild(el);
  }
  el.href = href;
}

function upsertJsonLd(id: string, data: Record<string, unknown> | Record<string, unknown>[]) {
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
    const known = SERVICE_SEO[slug];
    if (known) {
      return {
        path,
        title: known.title,
        description: known.description,
        keywords: known.keywords,
      };
    }
    const label = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    return {
      path,
      title: `${label} Ethiopia & Oromia | ${SITE_NAME}`,
      description: `${label} by Gindeberet General Construction PLC — construction company in Ethiopia, Oromia, and Addis Ababa.`,
      keywords: DEFAULT_KEYWORDS,
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
  document.documentElement.lang = 'en';

  upsertMeta('name', 'description', page.description);
  upsertMeta('name', 'keywords', page.keywords || DEFAULT_KEYWORDS);
  upsertMeta('name', 'author', SITE_NAME);
  upsertMeta(
    'name',
    'robots',
    page.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'
  );
  upsertMeta('name', 'googlebot', page.noindex ? 'noindex, nofollow' : 'index, follow');
  upsertMeta('name', 'geo.region', 'ET-AA');
  upsertMeta('name', 'geo.placename', 'Addis Ababa, Oromia, Ethiopia');
  upsertMeta('name', 'geo.position', `${OFFICE.lat};${OFFICE.lng}`);
  upsertMeta('name', 'ICBM', `${OFFICE.lat}, ${OFFICE.lng}`);

  upsertMeta('property', 'og:type', page.path === '/' ? 'website' : 'article');
  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:title', page.title);
  upsertMeta('property', 'og:description', page.description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', image);
  upsertMeta('property', 'og:locale', 'en_ET');
  upsertMeta('property', 'og:locale:alternate', 'om_ET');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', page.title);
  upsertMeta('name', 'twitter:description', page.description);
  upsertMeta('name', 'twitter:image', image);

  upsertLink('canonical', url);
  upsertLink('alternate', url, 'en');
  upsertLink('alternate', url, 'x-default');

  const serviceList = SERVICES.map((s) => ({
    '@type': 'Service',
    name: s.title,
    description: s.lead,
    areaServed: [
      { '@type': 'Country', name: 'Ethiopia' },
      { '@type': 'AdministrativeArea', name: 'Oromia' },
      { '@type': 'City', name: 'Addis Ababa' },
    ],
    provider: { '@id': `${origin}/#organization` },
    url: `${origin}/services/${s.slug}`,
  }));

  upsertJsonLd('seo-org-jsonld', {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness', 'GeneralContractor'],
    '@id': `${origin}/#organization`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    alternateName: [
      'Gindeberet Construction',
      'Gindeberet General Construction',
      'Gindeberet Construction PLC',
      'Gindeberet',
    ],
    url: origin,
    logo: image,
    image,
    description: DEFAULT_DESCRIPTION,
    foundingDate: '2012',
    telephone: ['+251911908456', '+251917000912'],
    email: 'gindeberetconstruction278@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Near Global Hotel Lancha',
      addressLocality: 'Addis Ababa',
      addressRegion: 'Oromia',
      addressCountry: 'ET',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: OFFICE.lat,
      longitude: OFFICE.lng,
    },
    areaServed: [
      { '@type': 'Country', name: 'Ethiopia' },
      { '@type': 'AdministrativeArea', name: 'Oromia' },
      { '@type': 'City', name: 'Addis Ababa' },
      { '@type': 'City', name: 'Jimma' },
      { '@type': 'City', name: 'Shaggar' },
      { '@type': 'City', name: 'Shashamane' },
    ],
    knowsAbout: [
      'Construction company in Ethiopia',
      'Construction company in Addis Ababa',
      'Construction company in Oromia',
      'Road construction',
      'Building construction',
      'Water works',
      'Corridor construction',
      'Electro-mechanical works',
      'Machinery rental',
      'Civil engineering',
      'Infrastructure contractor',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Construction services',
      itemListElement: serviceList,
    },
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
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/portfolio?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  });

  const crumbs: { '@type': string; position: number; name: string; item: string }[] = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
  ];
  if (page.path !== '/') {
    const parts = page.path.split('/').filter(Boolean);
    parts.forEach((part, i) => {
      const itemPath = '/' + parts.slice(0, i + 1).join('/');
      crumbs.push({
        '@type': 'ListItem',
        position: i + 2,
        name: part
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        item: `${origin}${itemPath}`,
      });
    });
  }
  upsertJsonLd('seo-breadcrumb-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs,
  });

  upsertJsonLd('seo-faq-jsonld', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Gindeberet a construction company in Ethiopia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Gindeberet General Construction PLC is a construction company PLC based in Addis Ababa, serving clients across Ethiopia and Oromia since 2012.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Gindeberet Construction located in Addis Ababa?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our head office is near Global Hotel Lancha, Addis Ababa, Ethiopia. Contact us via the website contact page for directions and enquiries.',
        },
      },
      {
        '@type': 'Question',
        name: 'What construction services does Gindeberet provide in Oromia and Ethiopia?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We deliver road construction, building construction, water works, corridor packages, electro-mechanical works, and machinery rental across Ethiopia and Oromia.',
        },
      },
    ],
  });
}
