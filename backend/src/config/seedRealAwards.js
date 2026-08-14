/**
 * Replace landing awards with real certificates + images.
 * Run: node src/config/seedRealAwards.js
 */
const prisma = require('./database');

const AWARDS = [
  {
    title: 'Horro Guduru Health Office',
    description:
      'Certificate of Appreciation — completing the Horro Guduru Wollega Zone Health Office building on time.',
    icon: '01',
    imageUrl: '/images/awards/horro-guduru-health-office.png',
  },
  {
    title: 'Jimma — Buara Boru School',
    description:
      'Jimma City Municipality / Helping Hands — support of 204,347.83 birr for Buara Boru Primary School.',
    icon: '02',
    imageUrl: '/images/awards/jimma-buara-boru-school.png',
  },
  {
    title: 'Oromia Construction Authority',
    description:
      'Certificate of Appreciation for strong performance in regional construction (2012 E.C.).',
    icon: '03',
    imageUrl: '/images/awards/oromia-construction-authority.png',
  },
  {
    title: 'Industry Achievement Trophy',
    description: 'Industry recognition trophy for construction excellence.',
    icon: '04',
    imageUrl: '/images/awards/achievement-trophy.png',
  },
  {
    title: 'Chora — Dabbasoo Health Center',
    description:
      'Certificate of Appreciation for Dabbasoo Sooroo health facility works in Chora District.',
    icon: '05',
    imageUrl: '/images/awards/chora-dabbasoo-health-center.png',
  },
  {
    title: 'Ministry of Revenues 2024/25',
    description:
      'Certificate of Recognition for tax compliance and results in the 2024/2025 fiscal year.',
    icon: '06',
    imageUrl: '/images/awards/mor-tax-2024-2025.png',
  },
  {
    title: 'Boorracha Health Center',
    description:
      'Certificate of Appreciation for health facility construction in Boorracha District (Bunno Bedele).',
    icon: '07',
    imageUrl: '/images/awards/boorracha-health-center.png',
  },
  {
    title: 'Ministry of Revenues 2023/24',
    description:
      'Certificate of Recognition for tax compliance and results in the 2023/2024 fiscal year.',
    icon: '08',
    imageUrl: '/images/awards/mor-tax-2023-2024.png',
  },
];

async function main() {
  console.log('Seeding real awards…');
  await prisma.award.deleteMany({});
  await prisma.award.createMany({ data: AWARDS });
  const count = await prisma.award.count();
  console.log(`Done — ${count} awards saved.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
