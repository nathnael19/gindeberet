const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const prisma = require('../config/database');

const CONTRACTOR = 'Gindeberet General Construction PLC';

function progressLabel(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'COMPLETED') return '100%';
  if (s === 'ACTIVE') return 'On going';
  return 'Pending';
}

function mapProjectRow(p, index) {
  return {
    no: index + 1,
    id: p.id,
    projectName: p.name || '',
    clientName: p.client || '',
    contractor: CONTRACTOR,
    contractAmount: p.budget || '—',
    location: p.location || '',
    category: p.category || '',
    year: p.year || '',
    commencement: p.year ? String(p.year) : '—',
    contractPeriod: p.duration || '—',
    totalPeriod: p.duration || '—',
    progress: progressLabel(p.status),
    status: String(p.status || '').toLowerCase(),
    qualityIssues: 'No',
    socialEnvIssues: 'No',
    isPublic: Boolean(p.isPublic),
  };
}

async function loadProjects({ publicOnly }) {
  const projects = await prisma.project.findMany({
    where: publicOnly ? { isPublic: true } : undefined,
    orderBy: [{ year: 'desc' }, { name: 'asc' }],
  });
  return projects.map((p, i) => mapProjectRow(p, i));
}

function buildSummary(rows) {
  const byCategory = {};
  const byYear = {};
  let completed = 0;
  let active = 0;
  for (const r of rows) {
    byCategory[r.category || 'Other'] = (byCategory[r.category || 'Other'] || 0) + 1;
    byYear[r.year || '—'] = (byYear[r.year || '—'] || 0) + 1;
    if (r.status === 'completed') completed += 1;
    if (r.status === 'active') active += 1;
  }
  return {
    total: rows.length,
    completed,
    active,
    pending: rows.length - completed - active,
    byCategory,
    byYear,
  };
}

const getPublicProfile = async (_req, res) => {
  try {
    const rows = await loadProjects({ publicOnly: true });
    res.json({
      success: true,
      data: {
        company: CONTRACTOR,
        title: 'Company Project Profile',
        generatedAt: new Date().toISOString(),
        summary: buildSummary(rows),
        rows,
        sharePath: '/company-profile',
      },
    });
  } catch (error) {
    console.error('company profile public:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load profile' });
  }
};

const getAdminProfile = async (_req, res) => {
  try {
    const rows = await loadProjects({ publicOnly: false });
    res.json({
      success: true,
      data: {
        company: CONTRACTOR,
        title: 'Company Project Profile',
        generatedAt: new Date().toISOString(),
        summary: buildSummary(rows),
        rows,
        sharePath: '/company-profile',
        note: 'Public share link shows projects published on the website (isPublic).',
      },
    });
  } catch (error) {
    console.error('company profile admin:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load profile' });
  }
};

function wrapText(text, font, size, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

async function buildProfilePdf(rows, { publicOnly }) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 842; // A4 landscape
  const pageHeight = 595;
  const margin = 28;
  const titleSize = 14;
  const headerSize = 7.5;
  const cellSize = 7;
  const lineH = 10;

  const cols = [
    { key: 'no', label: 'No', w: 22 },
    { key: 'projectName', label: 'Project Name', w: 150 },
    { key: 'clientName', label: 'Client Name', w: 120 },
    { key: 'contractor', label: 'Contractor', w: 110 },
    { key: 'contractAmount', label: 'Contract Amount (ETB)', w: 88 },
    { key: 'commencement', label: 'Year', w: 36 },
    { key: 'contractPeriod', label: 'Period', w: 55 },
    { key: 'progress', label: 'Progress', w: 48 },
    { key: 'qualityIssues', label: 'Quality', w: 40 },
    { key: 'socialEnvIssues', label: 'Social/Env', w: 48 },
  ];

  const tableWidth = cols.reduce((s, c) => s + c.w, 0);
  const startX = margin + Math.max(0, (pageWidth - margin * 2 - tableWidth) / 2);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawHeaderBand = () => {
    page.drawText(CONTRACTOR, {
      x: margin,
      y: y - titleSize,
      size: titleSize,
      font: fontBold,
      color: rgb(0.12, 0.12, 0.12),
    });
    y -= titleSize + 6;
    const subtitle = publicOnly
      ? 'Company Project Profile — Published projects'
      : 'Company Project Profile — Full project history';
    page.drawText(subtitle, {
      x: margin,
      y: y - 10,
      size: 9,
      font,
      color: rgb(0.35, 0.35, 0.35),
    });
    page.drawText(`Generated ${new Date().toLocaleDateString('en-GB')}`, {
      x: pageWidth - margin - 120,
      y: y - 10,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 22;
  };

  const drawTableHeader = () => {
    let x = startX;
    page.drawRectangle({
      x: startX,
      y: y - lineH - 4,
      width: tableWidth,
      height: lineH + 6,
      color: rgb(0.12, 0.12, 0.12),
    });
    for (const col of cols) {
      page.drawText(col.label, {
        x: x + 2,
        y: y - lineH,
        size: headerSize,
        font: fontBold,
        color: rgb(1, 1, 1),
        maxWidth: col.w - 4,
      });
      x += col.w;
    }
    y -= lineH + 8;
  };

  const newPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
    drawHeaderBand();
    drawTableHeader();
  };

  drawHeaderBand();
  drawTableHeader();

  let rowIndex = 0;
  for (const row of rows) {
    const cellLines = cols.map((col) =>
      wrapText(String(row[col.key] ?? ''), font, cellSize, col.w - 4)
    );
    const rowLines = Math.max(1, ...cellLines.map((l) => l.length));
    const rowHeight = rowLines * lineH + 6;

    if (y - rowHeight < margin + 20) {
      newPage();
    }

    if (rowIndex % 2 === 0) {
      page.drawRectangle({
        x: startX,
        y: y - rowHeight + 2,
        width: tableWidth,
        height: rowHeight,
        color: rgb(0.96, 0.96, 0.94),
      });
    }

    let x = startX;
    for (let c = 0; c < cols.length; c += 1) {
      const lines = cellLines[c];
      lines.forEach((line, li) => {
        page.drawText(line, {
          x: x + 2,
          y: y - lineH - li * lineH,
          size: cellSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
          maxWidth: cols[c].w - 4,
        });
      });
      x += cols[c].w;
    }
    y -= rowHeight;
    rowIndex += 1;
  }

  // Footer on last page
  page.drawText(`${rows.length} projects · ${CONTRACTOR}`, {
    x: margin,
    y: 16,
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return pdfDoc.save();
}

const downloadPdf = async (req, res) => {
  try {
    const isAdmin = Boolean(req.user);
    const publicOnly = !isAdmin || String(req.query.scope || '') === 'public';
    const rows = await loadProjects({ publicOnly });
    const bytes = await buildProfilePdf(rows, { publicOnly });
    const filename = `Gindeberet-Company-Profile-${new Date().toISOString().slice(0, 10)}.pdf`;

    // Prefer attachment stream for large tables; also offer base64 for smaller payloads
    const b64 = Buffer.from(bytes).toString('base64');
    if (String(req.query.format || '') === 'json' || b64.length < 900_000) {
      return res.json({
        success: true,
        data: {
          filename,
          pdfBase64: b64,
          count: rows.length,
        },
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(bytes));
  } catch (error) {
    console.error('company profile pdf:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to build PDF' });
  }
};

module.exports = {
  getPublicProfile,
  getAdminProfile,
  downloadPdf,
  CONTRACTOR,
};
