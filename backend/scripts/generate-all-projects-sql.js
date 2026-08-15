/**
 * Generate prisma/fix-all-projects.sql for phpMyAdmin (all 35 GB projects).
 * Run: node scripts/generate-all-projects-sql.js
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
  /async function seedSheetProjects[\s\S]*$/,
  'module.exports = { ALL_PROJECTS };'
);
const tmp = path.join(__dirname, '../_tmp_all_projects.js');
fs.writeFileSync(tmp, src);
const { ALL_PROJECTS } = require(tmp);
fs.unlinkSync(tmp);

const now = 'NOW(3)';
const sql = [];
sql.push('-- Import ALL 35 company projects (GB001-GB035), published.');
sql.push('-- phpMyAdmin → gindebsx_gindeberet_db → Import');
sql.push('SET NAMES utf8mb4;');
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
    `  description=VALUES(description), highlights=VALUES(highlights), image=VALUES(image), isPublic=1, updatedAt=${now};`
  );
  sql.push('');
}

sql.push("UPDATE projects SET isPublic = 1 WHERE id LIKE 'GB%';");
sql.push('');

const out = path.join(__dirname, '../prisma/fix-all-projects.sql');
fs.writeFileSync(out, sql.join('\n'), 'utf8');
console.log('Wrote', out, 'count=', ALL_PROJECTS.length);
