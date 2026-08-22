const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { seedSheetProjects } = require('../config/seedSheetProjects');
const { ensureResetTable } = require('../controllers/passwordResetController');

const { DEFAULT_ADMIN_EMAIL, PUBLIC_CONTACT_EMAIL } = require('../config/emails');

const ADMIN_EMAIL = DEFAULT_ADMIN_EMAIL.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Gindeberetplc@246';

const AWARDS = [
  {
    title: 'Horro Guduru Health Office',
    description:
      'Certificate of Appreciation - completing the Horro Guduru Wollega Zone Health Office building on time.',
    icon: '01',
    imageUrl: '/images/awards/horro-guduru-health-office.png',
  },
  {
    title: 'Jimma - Buara Boru School',
    description:
      'Jimma City Municipality / Helping Hands - support of 204,347.83 birr for Buara Boru Primary School.',
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
    title: 'Chora - Dabbasoo Health Center',
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

/**
 * Runs inside the live Passenger process (avoids cPanel "Run JS" Prisma panic).
 */
async function ensureAdminAccount() {
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const byEmail = await prisma.adminUser.findUnique({ where: { email } });
  if (byEmail) {
    await prisma.adminUser.update({
      where: { id: byEmail.id },
      data: {
        password,
        role: 'SUPER_ADMIN',
        isActive: true,
        firstName: byEmail.firstName || 'Admin',
        lastName: byEmail.lastName || 'Gindeberet',
      },
    });
  } else {
    const legacy = await prisma.adminUser.findUnique({
      where: { email: 'admin@gindeberet.com' },
    });
    if (legacy) {
      await prisma.adminUser.update({
        where: { id: legacy.id },
        data: {
          email,
          password,
          role: 'SUPER_ADMIN',
          isActive: true,
          firstName: legacy.firstName || 'Admin',
          lastName: legacy.lastName || 'Gindeberet',
        },
      });
    } else {
      await prisma.adminUser.create({
        data: {
          email,
          password,
          firstName: 'Admin',
          lastName: 'Gindeberet',
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      });
    }
  }

  await prisma.adminUser.updateMany({
    where: {
      email: { not: email },
      role: 'SUPER_ADMIN',
    },
    data: { isActive: false },
  });

  return { email };
}

async function fixPublicContent() {
  await ensureResetTable();
  const admin = await ensureAdminAccount();

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
      phone: '+251 911 908 456\n+251 917 000 912',
      workingHours: 'Mon-Fri, 8:00am-6:00pm',
      email: PUBLIC_CONTACT_EMAIL,
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685',
    },
    create: {
      id: 1,
      officeLocation: 'Near Global Hotel Lancha\nAddis Ababa, Ethiopia',
      phone: '+251 911 908 456\n+251 917 000 912',
      workingHours: 'Mon-Fri, 8:00am-6:00pm',
      email: PUBLIC_CONTACT_EMAIL,
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=8.9935718,38.7598685',
    },
  });

  await prisma.award.deleteMany({});
  await prisma.award.createMany({ data: AWARDS });

  const removedDemo = await prisma.project.deleteMany({
    where: { id: { in: ['PRJ001', 'PRJ002', 'PRJ003', 'PRJ004', 'PRJ005'] } },
  });

  const sheet = await seedSheetProjects(prisma);

  return {
    admin,
    awards: await prisma.award.count(),
    removedDemo: removedDemo.count,
    sheet,
    projects: await prisma.project.count(),
    publicProjects: await prisma.project.count({ where: { isPublic: true } }),
    sheetProjects: sheet.sheetCount || 35,
  };
}

module.exports = { fixPublicContent, ensureAdminAccount, AWARDS };
