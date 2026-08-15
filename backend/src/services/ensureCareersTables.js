const prisma = require('../config/database');

let ensured = false;
let ensuring = null;

/**
 * Create careers tables if missing (older DBs created before careers feature).
 * Safe to call on every request — runs once per process after success.
 */
async function ensureCareersTables() {
  if (ensured) return;
  if (ensuring) return ensuring;

  ensuring = (async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`job_vacancies\` (
        \`id\` INTEGER NOT NULL AUTO_INCREMENT,
        \`title\` VARCHAR(191) NOT NULL,
        \`department\` VARCHAR(191) NULL,
        \`location\` VARCHAR(191) NULL,
        \`employmentType\` VARCHAR(191) NULL,
        \`description\` TEXT NOT NULL,
        \`requirements\` TEXT NULL,
        \`deadline\` DATETIME(3) NULL,
        \`status\` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX \`job_vacancies_status_idx\`(\`status\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`job_applications\` (
        \`id\` INTEGER NOT NULL AUTO_INCREMENT,
        \`vacancyId\` INTEGER NOT NULL,
        \`fullName\` VARCHAR(191) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`phone\` VARCHAR(191) NULL,
        \`coverLetter\` TEXT NULL,
        \`cvUrl\` VARCHAR(191) NOT NULL,
        \`otherDocsUrl\` VARCHAR(191) NULL,
        \`status\` ENUM('PENDING', 'REVIEWING', 'SELECTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        \`adminNotes\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX \`job_applications_vacancyId_idx\`(\`vacancyId\`),
        INDEX \`job_applications_status_idx\`(\`status\`),
        UNIQUE INDEX \`job_applications_vacancyId_email_key\`(\`vacancyId\`, \`email\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    // FK may already exist — ignore duplicate errors
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE \`job_applications\`
        ADD CONSTRAINT \`job_applications_vacancyId_fkey\`
        FOREIGN KEY (\`vacancyId\`) REFERENCES \`job_vacancies\`(\`id\`)
        ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch (err) {
      const msg = String(err?.message || err);
      if (!/Duplicate|exists|1826|1215/i.test(msg)) {
        console.warn('ensureCareersTables FK:', msg);
      }
    }

    ensured = true;
  })();

  try {
    await ensuring;
  } finally {
    ensuring = null;
  }
}

module.exports = { ensureCareersTables };
