const path = require('path');
const fs = require('fs');
let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}
const { PDFDocument, degrees } = require('pdf-lib');
const prisma = require('../config/database');

const uploadDir = path.join(__dirname, '../../uploads');
const stampedDir = path.join(uploadDir, 'stamped');

if (!fs.existsSync(stampedDir)) {
  fs.mkdirSync(stampedDir, { recursive: true });
}

function requireSharp() {
  if (!sharp) {
    const err = new Error('Image stamping requires sharp, which is not installed on this server.');
    err.statusCode = 503;
    throw err;
  }
  return sharp;
}

function parsePages(spec, totalPages) {
  const raw = (spec || 'all').trim().toLowerCase();
  if (!raw || raw === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (raw === 'last' || raw === 'end') {
    return totalPages > 0 ? [totalPages - 1] : [];
  }
  if (raw === 'first') {
    return totalPages > 0 ? [0] : [];
  }

  const pages = new Set();
  for (const part of raw.split(',')) {
    const token = part.trim();
    if (!token) continue;
    if (token.includes('-')) {
      const [a, b] = token.split('-').map((n) => parseInt(n.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      const start = Math.max(1, Math.min(a, b));
      const end = Math.min(totalPages, Math.max(a, b));
      for (let p = start; p <= end; p += 1) pages.add(p - 1);
    } else {
      const n = parseInt(token, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= totalPages) pages.add(n - 1);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

function resolvePosition(position, pageW, pageH, boxW, boxH, margin = 36) {
  const key = (position || 'bottom-right').toLowerCase();
  switch (key) {
    case 'top-left':
      return { x: margin, y: pageH - boxH - margin };
    case 'top-right':
      return { x: pageW - boxW - margin, y: pageH - boxH - margin };
    case 'bottom-left':
      return { x: margin, y: margin };
    case 'bottom-center':
      return { x: (pageW - boxW) / 2, y: margin };
    case 'center':
      return { x: (pageW - boxW) / 2, y: (pageH - boxH) / 2 };
    case 'bottom-right':
    default:
      return { x: pageW - boxW - margin, y: margin };
  }
}

function detectImageKind(bytes) {
  if (!bytes || bytes.length < 12) return 'unknown';
  // PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf';
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
  // JPEG SOI
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'gif';
  return 'unknown';
}

/**
 * Normalize any common image (JPG quirks, WebP, mislabeled PNG, etc.) to a
 * clean PNG buffer that pdf-lib can embed reliably.
 */
async function toEmbeddablePng(bytes, label = 'Image') {
  try {
    return await requireSharp()(bytes)
      .rotate() // honor EXIF orientation
      .ensureAlpha()
      .png({ compressionLevel: 6, adaptiveFiltering: true })
      .toBuffer();
  } catch (err) {
    throw new Error(
      `${label} could not be read (${err.message || 'unsupported format'}). Try PNG or JPG.`
    );
  }
}

async function loadOverlay(pdfDoc, filePath, label = 'Image') {
  const bytes = fs.readFileSync(filePath);
  const kind = detectImageKind(bytes);
  const ext = path.extname(filePath).toLowerCase();

  if (kind === 'pdf' || (ext === '.pdf' && kind !== 'png' && kind !== 'jpg' && kind !== 'webp')) {
    try {
      const source = await PDFDocument.load(bytes);
      const [embeddedPage] = await pdfDoc.embedPdf(source, [0]);
      return { kind: 'page', asset: embeddedPage, width: embeddedPage.width, height: embeddedPage.height };
    } catch (err) {
      // Some "PDF" uploads are mislabeled images — fall through to sharp
      if (kind === 'pdf') {
        throw new Error(`${label} PDF could not be read (${err.message || 'invalid PDF'}).`);
      }
    }
  }

  // Direct embed first for clean PNGs (fast path)
  if (kind === 'png') {
    try {
      const image = await pdfDoc.embedPng(bytes);
      return { kind: 'image', asset: image, width: image.width, height: image.height };
    } catch {
      /* normalize below */
    }
  }

  // pdf-lib rejects many real-world JPEGs ("SOI not found"); sharp fixes them.
  const pngBytes = await toEmbeddablePng(bytes, label);
  const image = await pdfDoc.embedPng(pngBytes);
  return { kind: 'image', asset: image, width: image.width, height: image.height };
}

/**
 * Draw stamp/signature. Use Normal blend — Multiply breaks some viewers (Edge "0 of 0").
 */
function drawOverlay(page, overlay, opts) {
  if (overlay.kind === 'page') {
    page.drawPage(overlay.asset, opts);
  } else {
    page.drawImage(overlay.asset, opts);
  }
}

function sanitizeDownloadName(originalName) {
  const base = path.basename(originalName || 'document', path.extname(originalName || ''));
  const safe = String(base)
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
  return `stamped-${safe || 'document'}.pdf`;
}

function assertPdfBuffer(buf, label = 'PDF') {
  if (!buf || buf.length < 8) {
    throw new Error(`${label} is empty or too small`);
  }
  const head = Buffer.from(buf).subarray(0, 5).toString('ascii');
  if (!head.startsWith('%PDF')) {
    throw new Error(`${label} is not a valid PDF (missing %PDF header)`);
  }
  return Buffer.from(buf);
}

exports.applyStamp = async (req, res, next) => {
  try {
    const documentFile = req.files?.document?.[0];
    const stampFile = req.files?.stamp?.[0];
    const signatureFile = req.files?.signature?.[0];

    if (!documentFile) {
      return res.status(400).json({ success: false, message: 'Document PDF is required' });
    }

    const docExt = path.extname(documentFile.originalname).toLowerCase();
    if (docExt !== '.pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF documents can be stamped. Please convert DOC/DOCX to PDF first.',
      });
    }

    if (!stampFile && !signatureFile) {
      return res.status(400).json({
        success: false,
        message: 'Upload a stamp and/or a signature image',
      });
    }

    const pagesSpec = req.body.pages || 'all';
    // Signature pages can differ from stamp pages (default: same as stamp pages)
    const signaturePagesSpec = (req.body.signaturePages || pagesSpec || 'all').trim() || 'all';
    const position = req.body.position || 'bottom-right';
    const signaturePosition = req.body.signaturePosition || 'top-of-stamp';
    // Keep ink strong by default; multiply blend already lets underlying text show through.
    const opacityRaw = Math.max(0, Math.min(100, parseFloat(req.body.opacity ?? '100')));
    const opacity = Math.max(0.35, opacityRaw / 100);
    const rotation = parseFloat(req.body.rotation ?? '0') || 0;
    const stampSize = Math.max(40, Math.min(400, parseFloat(req.body.size ?? '150') || 150));
    const signatureSize = Math.max(20, Math.min(300, parseFloat(req.body.signatureSize ?? '50') || 50));

    const pdfBytes = fs.readFileSync(documentFile.path);
    assertPdfBuffer(pdfBytes, 'Uploaded document');
    const pdfDoc = await PDFDocument.load(pdfBytes, {
      updateMetadata: false,
      ignoreEncryption: true,
    });
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('Gindeberet Secure Stamp');
    pdfDoc.setCreator('Gindeberet Admin');

    const pages = pdfDoc.getPages();
    if (!pages.length) {
      return res.status(400).json({ success: false, message: 'PDF has no pages' });
    }
    const stampIndexes = stampFile ? parsePages(pagesSpec, pages.length) : [];
    const signIndexes = signatureFile ? parsePages(signaturePagesSpec, pages.length) : [];

    if (stampFile && stampIndexes.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid pages selected for stamp' });
    }
    if (signatureFile && signIndexes.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid pages selected for signature' });
    }

    let stampOverlay = null;
    let stampDims = { width: stampSize, height: stampSize };
    if (stampFile) {
      stampOverlay = await loadOverlay(pdfDoc, stampFile.path, 'Stamp');
      const aspect = stampOverlay.height / stampOverlay.width;
      stampDims = { width: stampSize, height: stampSize * aspect };
    }

    let signatureOverlay = null;
    let sigDims = { width: signatureSize, height: signatureSize };
    if (signatureFile) {
      signatureOverlay = await loadOverlay(pdfDoc, signatureFile.path, 'Signature');
      const aspect = signatureOverlay.height / signatureOverlay.width;
      sigDims = { width: signatureSize, height: signatureSize * aspect };
    }

    // Stamp only on selected stamp pages
    if (stampOverlay) {
      for (const idx of stampIndexes) {
        const page = pages[idx];
        const { width: pageW, height: pageH } = page.getSize();
        const stampPos = resolvePosition(position, pageW, pageH, stampDims.width, stampDims.height);
        drawOverlay(page, stampOverlay, {
          x: stampPos.x,
          y: stampPos.y,
          width: stampDims.width,
          height: stampDims.height,
          rotate: degrees(rotation),
          opacity,
        });
      }
    }

    // Sign only on selected signature pages
    if (signatureOverlay) {
      const stampIndexSet = new Set(stampIndexes);
      for (const idx of signIndexes) {
        const page = pages[idx];
        const { width: pageW, height: pageH } = page.getSize();
        let sigX;
        let sigY;
        const rel = (signaturePosition || '').toLowerCase();
        // Relative-to-stamp only when this page also has a stamp
        if ((rel === 'top-of-stamp' || rel === 'top_of_stamp') && stampOverlay && stampIndexSet.has(idx)) {
          const stampPos = resolvePosition(position, pageW, pageH, stampDims.width, stampDims.height);
          sigX = stampPos.x + (stampDims.width - sigDims.width) / 2;
          sigY = stampPos.y + stampDims.height + 8;
        } else {
          const fallbackPos = rel === 'top-of-stamp' || rel === 'top_of_stamp' ? 'bottom-right' : signaturePosition;
          const pos = resolvePosition(fallbackPos, pageW, pageH, sigDims.width, sigDims.height);
          sigX = pos.x;
          sigY = pos.y;
        }
        drawOverlay(page, signatureOverlay, {
          x: sigX,
          y: sigY,
          width: sigDims.width,
          height: sigDims.height,
          rotate: degrees(rotation),
          opacity,
        });
      }
    }

    const stampedBytes = assertPdfBuffer(
      await pdfDoc.save({ useObjectStreams: false, addDefaultPage: false }),
      'Stamped PDF'
    );
    const outName = `stamped-${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    const outPath = path.join(stampedDir, outName);
    fs.writeFileSync(outPath, stampedBytes);

    // Re-read and verify what we wrote to disk
    assertPdfBuffer(fs.readFileSync(outPath), 'Saved stamped PDF');

    const stampedUrl = `/uploads/stamped/${outName}`;
    const originalUrl = `/uploads/${documentFile.filename}`;
    const stampUrl = stampFile ? `/uploads/${stampFile.filename}` : null;
    const signatureUrl = signatureFile ? `/uploads/${signatureFile.filename}` : null;
    const downloadName = sanitizeDownloadName(documentFile.originalname);

    const settings = {
      pages: pagesSpec,
      signaturePages: signaturePagesSpec,
      position,
      signaturePosition,
      opacity: opacityRaw,
      rotation,
      size: stampSize,
      signatureSize,
      blendMode: 'Normal',
    };

    const job = await prisma.stampJob.create({
      data: {
        originalName: documentFile.originalname,
        originalUrl,
        stampedUrl,
        stampUrl,
        signatureUrl,
        settings,
        createdBy: req.user?.userId || null,
      },
    });

    // Embed PDF in JSON so the browser saves real bytes (avoids proxy/HTML corruption).
    // Cap size so huge files still use the download endpoint.
    const MAX_INLINE = 12 * 1024 * 1024;
    const payload = {
      id: job.id,
      url: stampedUrl,
      filename: outName,
      originalName: documentFile.originalname,
      downloadName,
      size: stampedBytes.length,
      pdfBase64: stampedBytes.length <= MAX_INLINE ? stampedBytes.toString('base64') : null,
    };

    res.json({
      success: true,
      message: 'Document stamped successfully',
      data: payload,
    });
  } catch (error) {
    if (error?.message && /could not be read|SOI not found|is WEBP|is GIF|PNG|JPG|not a valid PDF|empty or too small|no pages|Encrypted/i.test(error.message)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.saveSignature = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Signature image is required' });
    }
    const name = (req.body.name || path.basename(file.originalname, path.extname(file.originalname))).trim();
    const saved = await prisma.savedSignature.create({
      data: {
        name: name || 'Signature',
        imageUrl: `/uploads/${file.filename}`,
        createdBy: req.user?.userId || null,
      },
    });
    res.json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

exports.listSignatures = async (req, res, next) => {
  try {
    const list = await prisma.savedSignature.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
};

exports.deleteSignature = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.savedSignature.delete({ where: { id } });
    res.json({ success: true, message: 'Signature deleted' });
  } catch (error) {
    next(error);
  }
};

/** Stream stamped PDF with Content-Disposition so browsers download reliably. */
exports.downloadStamped = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid job id' });
    }

    const job = await prisma.stampJob.findUnique({ where: { id } });
    if (!job || !job.stampedUrl) {
      return res.status(404).json({ success: false, message: 'Stamped file not found' });
    }

    const relative = String(job.stampedUrl).replace(/^\/+/, '');
    const filePath = path.join(__dirname, '../..', relative);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Stamped file missing on disk' });
    }

    let buf;
    try {
      buf = assertPdfBuffer(fs.readFileSync(filePath), 'Stored stamped PDF');
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const downloadName = sanitizeDownloadName(job.originalName);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', String(buf.length));
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.end(buf);
  } catch (error) {
    next(error);
  }
};
