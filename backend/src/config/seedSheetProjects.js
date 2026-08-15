/**
 * Full company project-history sheet (35 projects), published on import.
 * Run: node src/config/seedSheetProjects.js
 * Prefer phpMyAdmin: prisma/fix-all-projects.sql (no Prisma on cPanel).
 */
const prisma = require('./database');

const IMG = {
  roads: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1600&q=80',
  buildings: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
  water: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80',
  electro: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1600&q=80',
  bridges: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1600&q=80',
  corridors: 'https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=1600&q=80',
};

/** Approximate Gregorian display year from Ethiopian calendar year on the sheet. */
function gcYear(ecYear) {
  return String(Number(ecYear) + 8);
}

function statusFromProgress(progress) {
  const p = String(progress || '').toLowerCase();
  if (p.includes('100')) return 'COMPLETED';
  if (p.includes('progress') || p.includes('going') || p.includes('construction') || p.includes('50')) {
    return 'ACTIVE';
  }
  return 'PENDING';
}

/** Sheet Nos 2,8,18–22,25,27,29–32,34,35 → GB001–GB015 (were local-only before). */
const CORE_PROJECTS = [
  {
    id: 'GB001',
    sheetNo: 35,
    name: 'Degalo–Halaba Exit Corridor',
    client: 'Shashamane City Administration',
    budget: 'ETB 3,102,826,609.25',
    location: 'Shashamane, Oromia',
    category: 'Corridors',
    duration: '365 Days',
    year: '2026',
    status: 'ACTIVE',
    image: IMG.corridors,
    description:
      'Major exit corridor works linking Degalo to Halaba for Shashamane city administration.',
  },
  {
    id: 'GB002',
    sheetNo: 34,
    name: 'Furii Corridor LOT 2 (Hiwot Fana–NOC)',
    client: 'Shaggar City, Furii Sub-City Municipality',
    budget: 'ETB 2,663,657,876.71',
    location: 'Furii, Shaggar',
    category: 'Corridors',
    duration: '365 Days',
    year: '2025',
    status: 'ACTIVE',
    image: IMG.corridors,
    description: 'Furii corridor LOT 2 works between Hiwot Fana and NOC for Shaggar city.',
  },
  {
    id: 'GB003',
    sheetNo: 19,
    name: 'Qare Tule–Ajo DC-2 Rural Gravel Road',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 162,703,547.55',
    location: 'Qare Tule–Ajo, Oromia',
    category: 'Roads',
    duration: '365 Days',
    year: '2023',
    status: 'COMPLETED',
    image: IMG.roads,
    description: 'DC-2 rural gravel road package under the LLRP programme.',
  },
  {
    id: 'GB004',
    sheetNo: 25,
    name: 'Shaggar Roadside Corridor — Koyye Feche LOT 1',
    client: 'Shaggar City Real Estate and Construction Corporation (sub-contract)',
    budget: 'ETB 162,703,547.55',
    location: 'Koyye Feche, Shaggar',
    category: 'Corridors',
    duration: '365 Days',
    year: '2024',
    status: 'ACTIVE',
    image: IMG.corridors,
    description: 'Roadside corridor LOT 1 at Koyye Feche for Shaggar city.',
  },
  {
    id: 'GB005',
    sheetNo: 32,
    name: 'Ambelia Small-Scale Irrigation',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 77,810,265.00',
    location: 'Ambelia, Oromia',
    category: 'Water',
    duration: '360 Days',
    year: '2025',
    status: 'ACTIVE',
    image: IMG.water,
    description: 'Small-scale irrigation works under the LLRP programme.',
  },
  {
    id: 'GB006',
    sheetNo: 29,
    name: 'Abbichuu Model Primary School',
    client: 'Shaggar City Education Office',
    budget: 'ETB 67,429,045.26',
    location: 'Furii Sub-City, Shaggar',
    category: 'Buildings',
    duration: '365 Days',
    year: '2024',
    status: 'COMPLETED',
    image: IMG.buildings,
    description: 'Construction of Abbichuu model primary school for Shaggar city education office.',
  },
  {
    id: 'GB007',
    sheetNo: 31,
    name: 'Birqicha River Bridge',
    client: 'Wajjira Abba Alangaa, Horro Guduru Wallaga',
    budget: 'ETB 67,282,013.15',
    location: 'Horro Guduru Wallaga, Oromia',
    category: 'Bridges',
    duration: '365 Days',
    year: '2025',
    status: 'ACTIVE',
    image: IMG.bridges,
    description: 'River bridge construction at Birqicha in Horro Guduru Wallaga.',
  },
  {
    id: 'GB008',
    sheetNo: 18,
    name: 'Horro Guduru Wallaga Health Office (G+4)',
    client: 'Horro Guduru Wallaga Zone Health Office',
    budget: 'ETB 60,555,741.40',
    location: 'Horro Guduru Wallaga, Oromia',
    category: 'Buildings',
    duration: '550 Days',
    year: '2022',
    status: 'COMPLETED',
    image: IMG.buildings,
    description: 'G+4 zone health office building for Horro Guduru Wallaga.',
  },
  {
    id: 'GB009',
    sheetNo: 21,
    name: 'Dero Hara Gura DC-2 Rural Road',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 46,056,343.39',
    location: 'Dero Hara Gura, Oromia',
    category: 'Roads',
    duration: '180 Days',
    year: '2023',
    status: 'COMPLETED',
    image: IMG.roads,
    description: 'DC-2 rural road package at Dero Hara Gura under LLRP.',
  },
  {
    id: 'GB010',
    sheetNo: 20,
    name: 'Chora Woreda Health Office',
    client: 'Chora Woreda Health Office / Jimma City Education Office',
    budget: 'ETB 40,473,247.03',
    location: 'Chora, Oromia',
    category: 'Buildings',
    duration: '365 Days',
    year: '2023',
    status: 'COMPLETED',
    image: IMG.buildings,
    description: 'Woreda health office building in Chora district.',
  },
  {
    id: 'GB011',
    sheetNo: 22,
    name: 'Jimma Earth-Pressed Municipal Road',
    client: 'Jimma City Administration',
    budget: 'ETB 38,895,650.00',
    location: 'Jimma, Oromia',
    category: 'Roads',
    duration: '180 Days',
    year: '2023',
    status: 'COMPLETED',
    image: IMG.roads,
    description: 'Earth-pressed municipal road works for Jimma city administration.',
  },
  {
    id: 'GB012',
    sheetNo: 27,
    name: 'Furniture & Electro-Mechanical Works — Chora Health G+4',
    client: 'Chora Woreda Health Office',
    budget: 'ETB 37,199,040.71',
    location: 'Chora, Oromia',
    category: 'Electro-Mechanical',
    duration: '365 Days',
    year: '2024',
    status: 'COMPLETED',
    image: IMG.electro,
    description: 'Furniture and electro-mechanical package for Chora G+4 health facility.',
  },
  {
    id: 'GB013',
    sheetNo: 30,
    name: 'Gudannee Community Health Post (CHP)',
    client: 'Borecha Health Office',
    budget: 'ETB 36,904,922.17',
    location: 'Gudannee / Borecha, Oromia',
    category: 'Buildings',
    duration: '360 Days',
    year: '2024',
    status: 'COMPLETED',
    image: IMG.buildings,
    description: 'Community health post construction at Gudannee for Borecha health office.',
  },
  {
    id: 'GB014',
    sheetNo: 8,
    name: 'Bonga Pressure Lines & Electro-Mechanical Works',
    client: 'Bonga Town (sub-contract)',
    budget: 'ETB 22,357,873.82',
    location: 'Bonga, Ethiopia',
    category: 'Electro-Mechanical',
    duration: '720 Days',
    year: '2019',
    status: 'COMPLETED',
    image: IMG.electro,
    description:
      'Civil works, supply and installation of main pressure lines, fittings and electro-mechanical works for Bonga town.',
  },
  {
    id: 'GB015',
    sheetNo: 2,
    name: 'Meko Water Treatment Plant Package',
    client: 'Oromia Regional State Construction Works Corporation',
    budget: 'ETB 24,813,202.34',
    location: 'Meko, Oromia',
    category: 'Water',
    duration: '365 Days',
    year: '2017',
    status: 'COMPLETED',
    image: IMG.water,
    description:
      'Water treatment plant, fence, store, guard house and rotto stand at Meko for Oromia Construction Works Corporation.',
  },
];

/**
 * Remaining sheet rows (Nos 1,3–7,9–17,23,24,26,28,33) → GB016–GB035.
 */
const NEW_PROJECTS = [
  {
    id: 'GB016',
    sheetNo: 1,
    name: 'Construction of Culverts in Different Kebeles',
    client: 'Jimmaa Hirmata Woreda',
    budget: 'ETB 11,882,298.13',
    location: 'Jimma Hirmata, Oromia',
    category: 'Roads',
    duration: '365 Days',
    year: gcYear(2009),
    status: statusFromProgress('100%'),
    image: IMG.roads,
    description:
      'Construction of culverts across multiple kebeles to improve drainage and all-weather access for local communities.',
  },
  {
    id: 'GB017',
    sheetNo: 3,
    name: 'Chomen Guduru G+2 Administration Building',
    client: 'Sub-contract',
    budget: 'ETB 12,767,607.77',
    location: 'Chomen Guduru, Oromia',
    category: 'Buildings',
    duration: '360 Days',
    year: gcYear(2010),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Construction of a G+2 administration building delivered as a sub-contract package.',
  },
  {
    id: 'GB018',
    sheetNo: 4,
    name: 'Warehouse, Drainage and Stadium Fence',
    client: 'Jimma City Youth and Sport Affairs Office (sub-contract)',
    budget: 'ETB 15,159,181.97',
    location: 'Jimma, Oromia',
    category: 'Buildings',
    duration: '720 Days',
    year: gcYear(2010),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Warehouse construction with drainage works and stadium fencing for youth and sport facilities.',
  },
  {
    id: 'GB019',
    sheetNo: 5,
    name: 'Administration, Library, Health Post and Veterinary Buildings',
    client: 'Oromia Regional State Construction Works Corporation',
    budget: 'ETB 15,159,181.97',
    location: 'Oromia',
    category: 'Buildings',
    duration: '360 Days',
    year: gcYear(2010),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description:
      'Package covering administration and library buildings together with health post and veterinary facilities.',
  },
  {
    id: 'GB020',
    sheetNo: 6,
    name: 'Compaction Roads Construction',
    client: 'Jimmaa Raaree Woreda Road Authority',
    budget: 'ETB 15,275,275.00',
    location: 'Jimma Raaree, Oromia',
    category: 'Roads',
    duration: '365 Days',
    year: gcYear(2010),
    status: statusFromProgress('100%'),
    image: IMG.roads,
    description: 'Construction and compaction of roads for the woreda road authority.',
  },
  {
    id: 'GB021',
    sheetNo: 7,
    name: 'Water Supply for Slaughter House and Surrounding Residentials',
    client: 'Jimma City Administration',
    budget: 'ETB 20,707,100.00',
    location: 'Jimma, Oromia',
    category: 'Water',
    duration: '360 Days',
    year: gcYear(2010),
    status: statusFromProgress('100%'),
    image: IMG.water,
    description:
      'Water supply works serving a slaughter house and surrounding residential areas in Jimma city.',
  },
  {
    id: 'GB022',
    sheetNo: 9,
    name: 'High School Furniture Project',
    client: 'Jimma Education Office',
    budget: 'ETB 4,480,236.25',
    location: 'Jimma, Oromia',
    category: 'Electro-Mechanical',
    duration: '180 Days',
    year: gcYear(2012),
    status: statusFromProgress('100%'),
    image: IMG.electro,
    description: 'Supply and installation of high school furniture for Jimma education office.',
  },
  {
    id: 'GB023',
    sheetNo: 10,
    name: 'Sidesa Unta 20m Span Girder River Bridge',
    client: 'Sub-contract from Bekele Debele',
    budget: 'ETB 11,905,200.20',
    location: 'Sidesa Unta, Oromia',
    category: 'Bridges',
    duration: '365 Days',
    year: gcYear(2012),
    status: statusFromProgress('100%'),
    image: IMG.bridges,
    description: 'Construction of a 20m span girder river bridge delivered as a sub-contract package.',
  },
  {
    id: 'GB024',
    sheetNo: 11,
    name: 'High School Furniture Project (Package 2)',
    client: 'Jimma Education Office',
    budget: 'ETB 3,310,080.19',
    location: 'Jimma, Oromia',
    category: 'Electro-Mechanical',
    duration: '180 Days',
    year: gcYear(2012),
    status: statusFromProgress('100%'),
    image: IMG.electro,
    description: 'Second high school furniture package for Jimma education office.',
  },
  {
    id: 'GB025',
    sheetNo: 12,
    name: 'Jimma Raaree Justice Office',
    client: 'Jimma Raaree Woreda Justice Office',
    budget: 'ETB 12,743,526.77',
    location: 'Jimma Raaree, Oromia',
    category: 'Buildings',
    duration: '365 Days',
    year: gcYear(2012),
    status: statusFromProgress('on progress'),
    image: IMG.buildings,
    description: 'Construction of the Jimma Raaree woreda justice office building.',
  },
  {
    id: 'GB026',
    sheetNo: 13,
    name: 'Fentale Pastoral Training Center',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 5,723,728.52',
    location: 'Fentale, Oromia',
    category: 'Buildings',
    duration: '365 Days',
    year: gcYear(2013),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Construction of a pastoral training center under the LLRP programme.',
  },
  {
    id: 'GB027',
    sheetNo: 14,
    name: 'Sudetan Chora Farmers G+3 Multipurpose Building',
    client: 'Sudetan Chora Farmers Cooperative Union',
    budget: 'ETB 3,310,080.19',
    location: 'Sudetan Chora, Oromia',
    category: 'Buildings',
    duration: '360 Days',
    year: gcYear(2013),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'G+3 multipurpose building for the Sudetan Chora farmers cooperative union.',
  },
  {
    id: 'GB028',
    sheetNo: 15,
    name: 'Gravel Road Resurfacing (Road Fund)',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 5,474,000.00',
    location: 'Oromia',
    category: 'Roads',
    duration: '365 Days',
    year: gcYear(2013),
    status: statusFromProgress('50%'),
    image: IMG.roads,
    description: 'Gravel road resurfacing works financed through the road fund / LLRP programme.',
  },
  {
    id: 'GB029',
    sheetNo: 16,
    name: 'Boru Deck Girder Bridge — Jimma',
    client: 'Jimma Zone Roads and Logistics',
    budget: 'ETB 17,837,976.81',
    location: 'Jimma Zone, Oromia',
    category: 'Bridges',
    duration: '180 Days',
    year: gcYear(2014),
    status: statusFromProgress('100%'),
    image: IMG.bridges,
    description: 'Construction of the Boru deck girder bridge for Jimma Zone roads and logistics.',
  },
  {
    id: 'GB030',
    sheetNo: 17,
    name: 'Sewena Pastoral Training Center',
    client: 'Oromia Irrigation and Pastoralist Development Bureau (LLRP)',
    budget: 'ETB 7,163,229.63',
    location: 'Sewena, Oromia',
    category: 'Buildings',
    duration: '4 Months',
    year: gcYear(2014),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Construction of Sewena pastoral training center under LLRP.',
  },
  {
    id: 'GB031',
    sheetNo: 23,
    name: 'Abattoir House at Chora Town',
    client: 'Bunno Bedele Chora District',
    budget: 'ETB 9,813,439.92',
    location: 'Chora Town, Oromia',
    category: 'Buildings',
    duration: '240 Days',
    year: gcYear(2015),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Construction of an abattoir house at Chora town.',
  },
  {
    id: 'GB032',
    sheetNo: 24,
    name: 'Public Toilets Construction',
    client: 'Jimma Town Water Supply and Sanitation',
    budget: 'ETB 16,132,447.61',
    location: 'Jimma, Oromia',
    category: 'Water',
    duration: '365 Days',
    year: gcYear(2015),
    status: statusFromProgress('100%'),
    image: IMG.water,
    description: 'Construction of public toilet facilities for Jimma town water supply and sanitation.',
  },
  {
    id: 'GB033',
    sheetNo: 26,
    name: 'Horro Guduru Wallaga Justice Office',
    client: 'Wajjira Abba Alangaa, Horro Guduru Wallaga Zone',
    budget: 'ETB 25,732,400.00',
    location: 'Horro Guduru Wallaga, Oromia',
    category: 'Buildings',
    duration: '365 Days',
    year: gcYear(2016),
    status: statusFromProgress('on progress'),
    image: IMG.buildings,
    description: 'Construction of the Horro Guduru Wallaga zone justice office.',
  },
  {
    id: 'GB034',
    sheetNo: 28,
    name: 'Maintenance of Chomen Guduru G+2 Justice and Police Office',
    client: 'Horro Guduru Wallaga Municipality Office',
    budget: 'ETB 13,417,050.00',
    location: 'Chomen Guduru, Oromia',
    category: 'Buildings',
    duration: '180 Days',
    year: gcYear(2016),
    status: statusFromProgress('100%'),
    image: IMG.buildings,
    description: 'Maintenance works on the Chomen Guduru G+2 justice and police office.',
  },
  {
    id: 'GB035',
    sheetNo: 33,
    name: 'Solid Waste Transfer Station — Sululta Sub-City, Shaggar',
    client: 'Shaggar City Real Estate and Construction Corporation (sub-contract)',
    budget: 'ETB 15,275,275.00',
    location: 'Sululta Sub-City, Shaggar',
    category: 'Infrastructure',
    duration: '365 Days',
    year: gcYear(2017),
    status: statusFromProgress('under construction'),
    image: IMG.buildings,
    description:
      'Construction of a solid waste transfer station at Sululta sub-city, Shaggar city.',
  },
];

const ALL_PROJECTS = [...CORE_PROJECTS, ...NEW_PROJECTS];

async function seedSheetProjects(client = prisma) {
  let created = 0;
  let updated = 0;
  const errors = [];

  for (const row of ALL_PROJECTS) {
    const data = {
      name: row.name,
      client: row.client,
      status: row.status,
      budget: row.budget,
      location: row.location,
      category: row.category,
      duration: row.duration,
      year: row.year,
      description: row.description,
      image: row.image,
      isPublic: true,
      highlights: [
        `Sheet No. ${row.sheetNo}`,
        `Contract: ${row.budget}`,
        `Duration: ${row.duration}`,
      ],
    };

    try {
      const existing = await client.project.findUnique({ where: { id: row.id } });
      if (existing) {
        await client.project.update({ where: { id: row.id }, data });
        updated += 1;
        console.log('updated', row.id, row.name);
      } else {
        await client.project.create({
          data: { id: row.id, ...data },
        });
        created += 1;
        console.log('created', row.id, '(sheet', row.sheetNo + ')', row.name);
      }
    } catch (err) {
      const msg = `${row.id}: ${err.message || err}`;
      console.error('seed row failed', msg);
      errors.push(msg);
    }
  }

  const sheetIds = ALL_PROJECTS.map((p) => p.id);
  try {
    await client.project.updateMany({
      where: { id: { in: sheetIds } },
      data: { isPublic: true },
    });
  } catch (err) {
    console.warn('publish updateMany failed:', err.message);
  }

  const total = await client.project.count();
  const published = await client.project.count({ where: { isPublic: true } });
  console.log(`Done. created=${created} updated=${updated} total=${total} published=${published}`);
  return { created, updated, total, published, sheetCount: ALL_PROJECTS.length, errors };
}

module.exports = {
  NEW_PROJECTS,
  CORE_PROJECTS,
  ALL_PROJECTS,
  seedSheetProjects,
  IMG,
  gcYear,
  statusFromProgress,
};

if (require.main === module) {
  seedSheetProjects()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
