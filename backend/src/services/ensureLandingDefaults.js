/**
 * Seed hero slides + services when empty so Admin Landing Content can edit/delete
 * the same content the public site shows as static fallbacks.
 */
const prisma = require('../config/database');

const DEFAULT_HERO = [
  {
    title1: 'Building Tomorrow',
    title2: 'Together',
    line: 'Roads, buildings, water & corridors across Ethiopia',
    imageUrl: '/images/hero.jpg',
    sortOrder: 0,
  },
  {
    title1: 'Quality',
    title2: 'On Every Site',
    line: 'Disciplined delivery from mobilization to handover',
    imageUrl: '/images/about.jpg',
    sortOrder: 1,
  },
  {
    title1: 'Trusted',
    title2: 'Regional Partner',
    line: 'Public and private packages across Oromia and beyond',
    imageUrl: '/images/portfolio-2.jpg',
    sortOrder: 2,
  },
];

const DEFAULT_SERVICES = [
  {
    slug: 'road-construction',
    indexLabel: '01',
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
    sortOrder: 0,
  },
  {
    slug: 'building-construction',
    indexLabel: '02',
    title: 'Building Construction',
    lead: 'High-quality building works fitted to the space, time, and cost of each project.',
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
    sortOrder: 1,
  },
  {
    slug: 'water-works',
    indexLabel: '03',
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
    sortOrder: 2,
  },
  {
    slug: 'electro-mechanical',
    indexLabel: '04',
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
    sortOrder: 3,
  },
  {
    slug: 'machinery-rental',
    indexLabel: '05',
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
    sortOrder: 4,
  },
  {
    slug: 'corridors',
    indexLabel: '06',
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
    sortOrder: 5,
  },
];

async function ensureLandingDefaults() {
  let heroCreated = 0;
  let servicesCreated = 0;

  try {
    if ((await prisma.heroSlide.count()) === 0) {
      await prisma.heroSlide.createMany({ data: DEFAULT_HERO });
      heroCreated = DEFAULT_HERO.length;
    }
  } catch (err) {
    console.error('ensureLandingDefaults hero:', err.message);
  }

  try {
    if ((await prisma.service.count()) === 0) {
      await prisma.service.createMany({ data: DEFAULT_SERVICES });
      servicesCreated = DEFAULT_SERVICES.length;
    }
  } catch (err) {
    console.error('ensureLandingDefaults services:', err.message);
  }

  return { heroCreated, servicesCreated };
}

module.exports = { ensureLandingDefaults, DEFAULT_HERO, DEFAULT_SERVICES };
