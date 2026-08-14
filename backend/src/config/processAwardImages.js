/**
 * Rotate/fix award photos and write to frontend/public/images/awards.
 * Run: node src/config/processAwardImages.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ASSETS =
  'C:/Users/Wak/.cursor/projects/c-Users-Wak-OneDrive-Desktop-New-Projects-gindeberet/assets';
const OUT = path.join(
  __dirname,
  '../../../frontend/public/images/awards'
);

const JOBS = [
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-27-24-eeecc48f-4b98-4612-b380-7962c7a4b6b3.png',
    out: 'horro-guduru-health-office.png',
    rotate: 0,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-27-17-c6858527-1082-451e-9faa-4f4e7152ca2a.png',
    out: 'jimma-buara-boru-school.png',
    rotate: 270,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-27-29-7462af8c-bbb2-4237-9fcc-35ac7570164f.png',
    out: 'oromia-construction-authority.png',
    rotate: 270,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-27-00-e9d01324-ea2d-4eff-bbea-47fcb5df0a72.png',
    out: 'achievement-trophy.png',
    rotate: 0,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-27-07-840565aa-f1cc-43ca-b8b6-02b870a9c353.png',
    out: 'chora-dabbasoo-health-center.png',
    rotate: 0,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-26-50-dead8a8a-a546-4011-91de-2bc7b65b990b.png',
    out: 'mor-tax-2024-2025.png',
    rotate: 180,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-26-55-7ac575cc-06fa-4efc-89c1-673992eacdb5.png',
    out: 'boorracha-health-center.png',
    rotate: 180,
  },
  {
    src: 'c__Users_Wak_AppData_Roaming_Cursor_User_workspaceStorage_2f10181c763a0898808ba58c139fb779_images_photo_2026-08-13_10-26-44-3c402960-e4fc-4fdf-a722-1f90d231f802.png',
    out: 'mor-tax-2023-2024.png',
    rotate: 180,
  },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const job of JOBS) {
    const input = path.join(ASSETS, job.src);
    const output = path.join(OUT, job.out);
    if (!fs.existsSync(input)) {
      console.warn('Missing', job.src);
      continue;
    }
    let pipeline = sharp(input).rotate(); // honor EXIF first
    if (job.rotate) pipeline = pipeline.rotate(job.rotate);
    await pipeline.png({ quality: 90, compressionLevel: 8 }).toFile(output);
    const meta = await sharp(output).metadata();
    console.log(`OK ${job.out} (${meta.width}x${meta.height}) rotate=${job.rotate}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
