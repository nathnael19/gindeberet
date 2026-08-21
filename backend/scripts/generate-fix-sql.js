/**
 * Generate prisma/fix-awards-projects.sql for phpMyAdmin
 * (avoids Prisma "timer has gone away" on cPanel Run JS).
 * Run: node scripts/generate-fix-sql.js
 */
const fs = require('fs');
const path = require('path');

function esc(s) {
  if (s == null) return 'NULL';
  return "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "''") + "'";
}

const sheetPath = path.join(__dirname, '../src/config/seedSheetProjects.js');
let src = fs.readFileSync(sheetPath, 'utf8');
src = src.replace(/const prisma = require\(.+?\);/, '');
src = src.replace(
  /async function main[\s\S]*$/,
  'module.exports = { ALL_PROJECTS, NEW_PROJECTS, CORE_PROJECTS };'
);
const tmp = path.join(__dirname, '../_tmp_sheet.js');
fs.writeFileSync(tmp, src);
const { ALL_PROJECTS } = require(tmp);
fs.unlinkSync(tmp);

const awards = [
  [
    'Horro Guduru Health Office',
    'Certificate of Appreciation - completing the Horro Guduru Wollega Zone Health Office building on time.',
    '01',
    '/images/awards/horro-guduru-health-office.png',
  ],
  [
    'Jimma - Buara Boru School',
    'Jimma City Municipality / Helping Hands - support of 204,347.83 birr for Buara Boru Primary School.',
    '02',
    '/images/awards/jimma-buara-boru-school.png',
  ],
  [
    'Oromia Construction Authority',
    'Certificate of Appreciation for strong performance in regional construction (2012 E.C.).',
    '03',
    '/images/awards/oromia-construction-authority.png',
  ],
  [
    'Industry Achievement Trophy',
    'Industry recognition trophy for construction excellence.',
    '04',
    '/images/awards/achievement-trophy.png',
  ],
  [
    'Chora - Dabbasoo Health Center',
    'Certificate of Appreciation for Dabbasoo Sooroo health facility works in Chora District.',
    '05',
    '/images/awards/chora-dabbasoo-health-center.png',
  ],
  [
    'Ministry of Revenues 2024/25',
    'Certificate of Recognition for tax compliance and results in the 2024/2025 fiscal year.',
    '06',
    '/images/awards/mor-tax-2024-2025.png',
  ],
  [
    'Boorracha Health Center',
    'Certificate of Appreciation for health facility construction in Boorracha District (Bunno Bedele).',
    '07',
    '/images/awards/boorracha-health-center.png',
  ],
  [
    'Ministry of Revenues 2023/24',
    'Certificate of Recognition for tax compliance and results in the 2023/2024 fiscal year.',
    '08',
    '/images/awards/mor-tax-2023-2024.png',
  ],
];

const now = 'NOW(3)';
const sql = [];
sql.push('-- Fix awards + projects WITHOUT running Prisma on cPanel.');
sql.push('-- phpMyAdmin → select DB gindebsx_gindeberet_db → Import this file.');
sql.push('SET NAMES utf8mb4;');
sql.push('');
sql.push('UPDATE site_settings SET');
sql.push("  phone = CONCAT('+251 911 908 456', CHAR(10), '+251 917 000 912'),");
sql.push("  email = 'gindeberetconstruction278@gmail.com',");
sql.push("  workingHours = 'Mon-Fri, 8:00am-6:00pm',");
sql.push("  officeLocation = CONCAT('Near Global Hotel Lancha', CHAR(10), 'Addis Ababa, Ethiopia'),");
sql.push(`  updatedAt = ${now}`);
sql.push('WHERE id = 1;');
sql.push('');
sql.push('DELETE FROM awards;');
sql.push(
  'INSERT INTO awards (title, description, icon, imageUrl, createdAt, updatedAt) VALUES'
);
sql.push(
  awards
    .map(
      ([t, d, i, u]) =>
        `(${esc(t)}, ${esc(d)}, ${esc(i)}, ${esc(u)}, ${now}, ${now})`
    )
    .join(',\n') + ';'
);
sql.push('');
sql.push(
  "DELETE FROM projects WHERE id IN ('PRJ001','PRJ002','PRJ003','PRJ004','PRJ005');"
);
sql.push('');

for (const row of ALL_PROJECTS) {
  const highlights = JSON.stringify([
    `Sheet No. ${row.sheetNo}`,
    `Contract: ${row.budget}`,
    `Duration: ${row.duration}`,
  ]);
  sql.push(
    'INSERT INTO projects (id, name, client, status, budget, location, category, duration, year, description, challenge, solution, highlights, image, isPublic, createdBy, createdAt, updatedAt)'
  );
  sql.push('VALUES (');
  sql.push(
    `  ${esc(row.id)}, ${esc(row.name)}, ${esc(row.client)}, ${esc(row.status)}, ${esc(row.budget)},`
  );
  sql.push(
    `  ${esc(row.location)}, ${esc(row.category)}, ${esc(row.duration)}, ${esc(row.year)},`
  );
  sql.push(
    `  ${esc(row.description)}, NULL, NULL, ${esc(highlights)}, ${esc(row.image)}, 1, NULL, ${now}, ${now}`
  );
  sql.push(')');
  sql.push('ON DUPLICATE KEY UPDATE');
  sql.push(
    '  name=VALUES(name), client=VALUES(client), status=VALUES(status), budget=VALUES(budget),'
  );
  sql.push(
    '  location=VALUES(location), category=VALUES(category), duration=VALUES(duration), year=VALUES(year),'
  );
  sql.push(
    `  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), updatedAt=${now};`
  );
  sql.push('');
}

sql.push('-- New rows insert as public; existing isPublic is preserved on update.');
sql.push('');

const out = path.join(__dirname, '../prisma/fix-awards-projects.sql');
fs.writeFileSync(out, sql.join('\n'), 'utf8');
console.log('Wrote', out, 'projects=', ALL_PROJECTS.length);
