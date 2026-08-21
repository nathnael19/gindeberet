/**
 * One-time cPanel content fix after empty-DB seed.
 * Run JS script: cpanel-fix-content.js
 *
 * Why awards/projects look empty on the live site:
 * - cPanel MySQL was created fresh (SQL import + sample seed only)
 * - Local laptop DB was NEVER copied to the server
 * - Sample awards had no imageUrl; sample projects had isPublic=false
 *
 * This script:
 * - Sets real phone/email
 * - Replaces awards with certificate images under /images/awards/*
 * - Removes demo PRJ001–PRJ005 rows
 * - Imports company sheet projects (GB016+) and publishes them
 */
const path = require('path');
const { execSync } = require('child_process');

process.chdir(path.join(__dirname));

try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
} catch (_) {
  /* optional */
}

const prisma = require('./src/config/database');

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
  console.log('1) Site settings (phone / email)…');
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
      phone: '+251 911 908 456\n+251 917 000 912',
      workingHours: 'Mon–Fri, 8:00am–6:00pm',
      email: 'gindeberetconstruction278@gmail.com',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685',
    },
    create: {
      id: 1,
      officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
      phone: '+251 911 908 456\n+251 917 000 912',
      workingHours: 'Mon–Fri, 8:00am–6:00pm',
      email: 'gindeberetconstruction278@gmail.com',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685',
    },
  });

  console.log('2) Real awards + certificate images…');
  await prisma.award.deleteMany({});
  await prisma.award.createMany({ data: AWARDS });
  console.log('   awards =', await prisma.award.count());

  console.log('3) Remove demo PRJ* sample projects…');
  const removed = await prisma.project.deleteMany({
    where: {
      id: { in: ['PRJ001', 'PRJ002', 'PRJ003', 'PRJ004', 'PRJ005'] },
    },
  });
  console.log('   removed =', removed.count);

  console.log('4) Import sheet projects (GB016+)…');
  execSync('node src/config/seedSheetProjects.js', {
    stdio: 'inherit',
    env: process.env,
  });

  console.log('5) Publish all remaining projects…');
  const published = await prisma.project.updateMany({
    data: { isPublic: true },
  });
  console.log('   published rows =', published.count);
  console.log('   total projects =', await prisma.project.count());
  console.log('   public projects =', await prisma.project.count({ where: { isPublic: true } }));

  console.log('\nOK. RESTART the Node app, then Ctrl+F5 on the website.');
  console.log('Note: older GB001–GB015 lived only on your local PC DB and were not on cPanel.');
  console.log('Re-add those in Admin if you still need them, or restore a local DB dump.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
