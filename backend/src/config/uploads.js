const fs = require('fs');
const path = require('path');

/**
 * Persistent upload directory.
 * Production default: sibling folder outside the deployed backend app
 * so FTP deploy / Node restart does not wipe uploaded images.
 */
function getUploadDir() {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }

  if (process.env.NODE_ENV === 'production') {
    return path.resolve(process.cwd(), '..', 'gindeberet_uploads');
  }

  return path.resolve(__dirname, '../../uploads');
}

function ensureUploadDir() {
  const dir = getUploadDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Copy files from legacy backend/uploads once (deploy folder) into persistent dir. */
function migrateLegacyUploadsIfNeeded() {
  const targetDir = ensureUploadDir();
  const legacyDir = path.resolve(__dirname, '../../uploads');

  if (targetDir === legacyDir || !fs.existsSync(legacyDir)) {
    return 0;
  }

  let copied = 0;
  const copyRecursive = (srcRoot, destRoot, relative = '') => {
    const srcPath = path.join(srcRoot, relative);
    const destPath = path.join(destRoot, relative);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      for (const entry of fs.readdirSync(srcPath)) {
        copyRecursive(srcRoot, destRoot, path.join(relative, entry));
      }
      return;
    }

    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      copied += 1;
    }
  };

  try {
    for (const entry of fs.readdirSync(legacyDir)) {
      copyRecursive(legacyDir, targetDir, entry);
    }
  } catch (err) {
    console.warn('Legacy upload migration skipped:', err.message);
    return 0;
  }

  if (copied > 0) {
    console.log(`Migrated ${copied} legacy upload file(s) → ${targetDir}`);
  }
  return copied;
}

module.exports = {
  getUploadDir,
  ensureUploadDir,
  migrateLegacyUploadsIfNeeded,
};
