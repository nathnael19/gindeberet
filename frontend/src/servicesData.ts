export interface ServiceDef {
  slug: string;
  index: string;
  title: string;
  lead: string;
  /** Matches project.category from the API */
  category: string;
  points: string[];
  overview: string;
  approach: string[];
  outcomes: string[];
  heroImage: string;
}

/** Static fallback when API/admin services are empty */
export const SERVICES: ServiceDef[] = [
  {
    slug: 'road-construction',
    index: '01',
    title: 'Road Construction',
    lead:
      'Creating unbroken passages of appropriate materials for effective vehicle and foot travel — free of geographic obstacles.',
    category: 'Roads',
    points: [
      'Urban & rural road packages',
      'Earthworks, base & paving',
      'Drainage and road furniture',
      'Rehabilitation and overlays',
    ],
    overview:
      'Road construction is about creating a continuous, well-built passage for vehicles and pedestrians. Gindeberet delivers durable road assets from local streets to major corridors, combining disciplined earthworks, quality paving, and finishing that meets client and agency standards — with traffic management that keeps routes usable during construction.',
    approach: [
      'Design coordination with client engineers and consultants',
      'Controlled earthworks, subgrade preparation, and base courses',
      'Asphalt and concrete paving to ride-quality targets',
      'Drainage, shoulders, markings, and furniture as one package',
    ],
    outcomes: [
      'Longer pavement life with fewer early defects',
      'Safer alignments and clearer roadside environments',
      'Predictable schedules through staged traffic control',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1800&q=80',
  },
  {
    slug: 'building-construction',
    index: '02',
    title: 'Building Construction',
    lead:
      'High-quality building works fitted to the space, time, and cost of each project.',
    category: 'Buildings',
    points: [
      'Commercial & institutional buildings',
      'Structural and finishing packages',
      'Quality control from foundation to handover',
      'Schedule and cost discipline',
    ],
    overview:
      'Building construction is one of our core strengths. We deliver high-quality buildings that fit the space, time, and budget of the project — coordinating structure, services, and finishes so clients receive assets that are ready for use and built to last.',
    approach: [
      'Clear method statements and programme control',
      'Foundations, structure, and envelope executed to specification',
      'Finishes and MEP interfaces coordinated on site',
      'Inspection-ready close-out with complete documentation',
    ],
    outcomes: [
      'Buildings delivered to agreed quality and programme',
      'Fewer rework cycles through staged inspections',
      'Clean handover packages for owners and operators',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80',
  },
  {
    slug: 'water-works',
    index: '03',
    title: 'Water Works',
    lead:
      'Water-work construction packages delivered to engineering standards for public and private clients.',
    category: 'Water',
    points: [
      'Water supply & distribution lines',
      'Drainage and related civil works',
      'Structures supporting water systems',
      'Testing and commissioning support',
    ],
    overview:
      'Water works are essential infrastructure for communities and industry. We construct water-related packages to engineering specifications — with trench safety, material control, and testing practices that protect both people and the completed system.',
    approach: [
      'Survey-controlled excavation and trench safety systems',
      'Pipeline installation and jointing to specification',
      'Associated civil and structural elements',
      'Pressure, infiltration, and handover testing with records',
    ],
    outcomes: [
      'Networks that pass required tests cleanly',
      'Assets built for inspection and long service life',
      'Sites ready for follow-on packages on schedule',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=80',
  },
  {
    slug: 'electro-mechanical',
    index: '04',
    title: 'Electro-Mechanical Works',
    lead:
      'Wood, metal, and electro-mechanical works that support Ethiopia’s growing construction demand.',
    category: 'Electro-Mechanical',
    points: [
      'Electro-mechanical installations',
      'Metal and wood production support',
      'Coordination with civil packages',
      'Skilled technical teams',
    ],
    overview:
      'Wood and metal production, together with electro-mechanical works, is a growing focus of the company. As the country advances, we participate in erecting electro-mechanical works and related packages — pairing technical teams with site coordination so installations fit the civil programme.',
    approach: [
      'Scope clarification with client and consultant teams',
      'Fabrication and installation sequenced with civil works',
      'On-site safety and quality checks at each stage',
      'As-built records and operator-ready handover',
    ],
    outcomes: [
      'Installations aligned to design and programme',
      'Reduced clashes through early coordination',
      'Clear documentation for maintenance teams',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1800&q=80',
  },
  {
    slug: 'machinery-rental',
    index: '05',
    title: 'Machinery Rental',
    lead:
      'Equipment provided on demand for valued clients who need to rent plant and machinery.',
    category: 'Machinery',
    points: [
      'Construction plant on demand',
      'Support for client-led sites',
      'Flexible rental arrangements',
      'Experienced equipment guidance',
    ],
    overview:
      'We provide machinery and equipment to valued clients on demand — and to those who need to rent plant for their own programmes. Our goal is reliable equipment support that keeps your site productive without locking capital in idle assets.',
    approach: [
      'Clarify plant type, duration, and site conditions',
      'Match equipment to the work package',
      'Coordinate delivery and retrieval with your programme',
      'Practical guidance from experienced field teams',
    ],
    outcomes: [
      'Right equipment when you need it',
      'Less downtime waiting for plant',
      'Flexible support alongside our construction services',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1800&q=80',
  },
  {
    slug: 'corridors',
    index: '06',
    title: 'Corridors',
    lead:
      'Transit and development corridors planned and built as complete packages — movement, access, and lasting regional links.',
    category: 'Corridors',
    points: [
      'Urban & regional transit corridors',
      'Right-of-way earthworks and paving',
      'Interchanges, junctions, and access links',
      'Corridor drainage and roadside works',
    ],
    overview:
      'Corridors are a standalone service of Gindeberet — not folded into buildings or general roads. We deliver transit and development corridor packages that connect places with disciplined earthworks, paving, junctions, and drainage so people and goods move safely across the region.',
    approach: [
      'Corridor alignment and staging agreed with clients and agencies',
      'Right-of-way clearing, earthworks, and structural packages',
      'Paving, junctions, and access links built as one programme',
      'Drainage, markings, and roadside finishing for long service life',
    ],
    outcomes: [
      'Continuous, reliable corridor assets ready for traffic',
      'Safer junctions and clearer access for communities',
      'Programmes that open sections in usable stages',
    ],
    heroImage:
      'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1800&q=80',
  },
];

const SLUG_ALIASES: Record<string, string> = {
  'roads-highways': 'road-construction',
  'transit-corridors': 'corridors',
  'civil-infrastructure': 'water-works',
  'bridges-structures': 'electro-mechanical',
};

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeService(raw: any): ServiceDef {
  return {
    slug: String(raw.slug || ''),
    index: String(raw.index || raw.indexLabel || '01'),
    title: String(raw.title || ''),
    lead: String(raw.lead || ''),
    category: String(raw.category || ''),
    points: asStringList(raw.points),
    overview: String(raw.overview || ''),
    approach: asStringList(raw.approach),
    outcomes: asStringList(raw.outcomes),
    heroImage: String(raw.heroImage || ''),
  };
}

export function resolveServices(apiServices?: any[] | null): ServiceDef[] {
  if (apiServices && apiServices.length > 0) {
    return apiServices.map(normalizeService).filter((s) => s.slug && s.title);
  }
  return SERVICES;
}

export function getServiceBySlug(
  slug: string,
  list?: ServiceDef[] | null
): ServiceDef | undefined {
  const resolved = SLUG_ALIASES[slug] || slug;
  const source = list && list.length > 0 ? list : SERVICES;
  return source.find((s) => s.slug === resolved);
}
