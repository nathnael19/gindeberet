const fs = require('fs');
const path = require('path');
const prisma = require('../config/database');
const { ensureCareersTables } = require('../services/ensureCareersTables');

const uploadDir = path.join(__dirname, '../../uploads');

function resolveUploadPath(storedUrl) {
  if (!storedUrl || typeof storedUrl !== 'string') return null;
  let pathname = storedUrl.trim();
  try {
    if (/^https?:\/\//i.test(pathname)) {
      pathname = new URL(pathname).pathname;
    }
  } catch {
    return null;
  }
  const marker = '/uploads/';
  const idx = pathname.indexOf(marker);
  const relative = idx >= 0 ? pathname.slice(idx + marker.length) : pathname.replace(/^\/+/, '');
  const filename = path.basename(relative);
  if (!filename || filename === '.' || filename === '..') return null;
  const filePath = path.resolve(uploadDir, filename);
  if (!filePath.startsWith(path.resolve(uploadDir) + path.sep)) return null;
  return { filePath, filename };
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return map[ext] || 'application/octet-stream';
}

/** End of calendar day for a deadline (local server time). */
function endOfDeadlineDay(value) {
  if (!value) return null;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [y, m, d] = value.trim().split('-').map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  }
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999);
}

/** Start of tomorrow (local) — earliest allowed new deadline. */
function startOfTomorrow() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

function isDeadlinePast(deadline) {
  if (!deadline) return false;
  const end = endOfDeadlineDay(deadline);
  return end ? end < new Date() : false;
}

async function closeExpiredVacancies() {
  try {
    const now = new Date();
    // `lt` alone excludes NULL deadlines in SQL
    await prisma.jobVacancy.updateMany({
      where: {
        status: 'OPEN',
        deadline: { lt: now },
      },
      data: { status: 'CLOSED' },
    });
  } catch (err) {
    console.warn('closeExpiredVacancies skipped:', err.message);
  }
}

function validateDeadlineOrError(deadline, { requiredForOpen = false } = {}) {
  if (!deadline) {
    if (requiredForOpen) {
      return 'Deadline is required for open vacancies';
    }
    return null;
  }
  const end = endOfDeadlineDay(deadline);
  if (!end) return 'Invalid deadline date';
  if (end < startOfTomorrow()) {
    return 'Deadline must be a future date (after today)';
  }
  return null;
}

const toPublicVacancy = (v) => ({
  id: v.id,
  title: v.title,
  department: v.department,
  location: v.location,
  employmentType: v.employmentType,
  description: v.description,
  requirements: v.requirements,
  deadline: v.deadline,
  status: v.status?.toLowerCase?.() || v.status,
  createdAt: v.createdAt,
  _count: v._count,
});

const openWhere = () => ({
  status: 'OPEN',
  OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
});

async function withCareersDb(handler) {
  await ensureCareersTables();
  return handler();
}

// Public: list open vacancies (auto-hides after deadline)
const getOpenVacancies = async (req, res) => {
  try {
    await withCareersDb(async () => {
      await closeExpiredVacancies();
      const vacancies = await prisma.jobVacancy.findMany({
        where: openWhere(),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          department: true,
          location: true,
          employmentType: true,
          description: true,
          requirements: true,
          deadline: true,
          status: true,
          createdAt: true,
        },
      });
      res.json({ success: true, data: vacancies.map(toPublicVacancy) });
    });
  } catch (error) {
    console.error('Get open vacancies error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load vacancies',
    });
  }
};

// Public: single open vacancy
const getOpenVacancy = async (req, res) => {
  try {
    await ensureCareersTables();
    await closeExpiredVacancies();
    const id = parseInt(req.params.id, 10);
    const vacancy = await prisma.jobVacancy.findFirst({
      where: { id, ...openWhere() },
    });
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }
    res.json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to load vacancy' });
  }
};

// Public: apply
const applyToVacancy = async (req, res) => {
  try {
    await ensureCareersTables();
    const vacancyId = parseInt(req.params.id, 10);
    const { fullName, email, phone, coverLetter, cvUrl, otherDocsUrl } = req.body;

    if (!fullName || !email || !cvUrl) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and CV are required',
      });
    }

    await closeExpiredVacancies();

    const vacancy = await prisma.jobVacancy.findFirst({
      where: { id: vacancyId, ...openWhere() },
    });
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'This vacancy is not open for applications' });
    }

    if (isDeadlinePast(vacancy.deadline)) {
      return res.status(400).json({ success: false, message: 'The application deadline has passed' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.jobApplication.findFirst({
      where: { vacancyId, email: normalizedEmail },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this vacancy with this email',
      });
    }

    const application = await prisma.jobApplication.create({
      data: {
        vacancyId,
        fullName: String(fullName).trim(),
        email: normalizedEmail,
        phone: phone ? String(phone).trim() : null,
        coverLetter: coverLetter ? String(coverLetter).trim() : null,
        cvUrl: String(cvUrl).trim(),
        otherDocsUrl: otherDocsUrl ? String(otherDocsUrl).trim() : null,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Your application has been submitted successfully',
      data: { id: application.id },
    });
  } catch (error) {
    console.error('Apply error:', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this vacancy with this email',
      });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to submit application' });
  }
};

// Admin: list all vacancies
const adminListVacancies = async (req, res) => {
  try {
    await ensureCareersTables();
    await closeExpiredVacancies();
    const vacancies = await prisma.jobVacancy.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { applications: true } } },
    });
    res.json({
      success: true,
      data: vacancies.map((v) => ({
        ...toPublicVacancy(v),
        applicationsCount: v._count.applications,
      })),
    });
  } catch (error) {
    console.error('Admin list vacancies error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load vacancies',
    });
  }
};

const adminCreateVacancy = async (req, res) => {
  try {
    await ensureCareersTables();
    const { title, department, location, employmentType, description, requirements, deadline, status } =
      req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const nextStatus = status === 'closed' || status === 'CLOSED' ? 'CLOSED' : 'OPEN';
    const deadlineErr = validateDeadlineOrError(deadline, { requiredForOpen: nextStatus === 'OPEN' });
    if (deadlineErr) {
      return res.status(400).json({ success: false, message: deadlineErr });
    }

    const vacancy = await prisma.jobVacancy.create({
      data: {
        title: String(title).trim(),
        department: department || null,
        location: location || null,
        employmentType: employmentType || null,
        description: String(description).trim(),
        requirements: requirements || null,
        deadline: deadline ? endOfDeadlineDay(deadline) : null,
        status: nextStatus,
      },
    });

    res.status(201).json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create vacancy' });
  }
};

const adminUpdateVacancy = async (req, res) => {
  try {
    await ensureCareersTables();
    const id = parseInt(req.params.id, 10);
    const { title, department, location, employmentType, description, requirements, deadline, status } =
      req.body;

    const existing = await prisma.jobVacancy.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }

    const data = {};
    if (title !== undefined) data.title = String(title).trim();
    if (department !== undefined) data.department = department || null;
    if (location !== undefined) data.location = location || null;
    if (employmentType !== undefined) data.employmentType = employmentType || null;
    if (description !== undefined) data.description = String(description).trim();
    if (requirements !== undefined) data.requirements = requirements || null;
    if (status !== undefined) {
      data.status = status === 'closed' || status === 'CLOSED' ? 'CLOSED' : 'OPEN';
    }

    const nextStatus = data.status || existing.status;
    if (deadline !== undefined) {
      if (!deadline) {
        if (nextStatus === 'OPEN') {
          return res.status(400).json({
            success: false,
            message: 'Deadline is required for open vacancies',
          });
        }
        data.deadline = null;
      } else {
        const end = endOfDeadlineDay(deadline);
        if (!end) {
          return res.status(400).json({ success: false, message: 'Invalid deadline date' });
        }
        const existingEnd = existing.deadline ? endOfDeadlineDay(existing.deadline) : null;
        const sameDay =
          existingEnd &&
          existingEnd.getFullYear() === end.getFullYear() &&
          existingEnd.getMonth() === end.getMonth() &&
          existingEnd.getDate() === end.getDate();
        if (!sameDay && end < startOfTomorrow()) {
          return res.status(400).json({
            success: false,
            message: 'Deadline must be a future date (after today)',
          });
        }
        data.deadline = end;
      }
    } else if (nextStatus === 'OPEN' && !existing.deadline) {
      return res.status(400).json({
        success: false,
        message: 'Deadline is required for open vacancies',
      });
    }

    const vacancy = await prisma.jobVacancy.update({ where: { id }, data });
    res.json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update vacancy' });
  }
};

const adminDeleteVacancy = async (req, res) => {
  try {
    await ensureCareersTables();
    const id = parseInt(req.params.id, 10);
    await prisma.jobVacancy.delete({ where: { id } });
    res.json({ success: true, message: 'Vacancy deleted' });
  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete vacancy' });
  }
};

// Admin: applications
const adminListApplications = async (req, res) => {
  try {
    await ensureCareersTables();
    const vacancyId = req.query.vacancyId ? parseInt(req.query.vacancyId, 10) : undefined;
    const status = req.query.status ? String(req.query.status).toUpperCase() : undefined;

    const applications = await prisma.jobApplication.findMany({
      where: {
        ...(vacancyId ? { vacancyId } : {}),
        ...(status && ['PENDING', 'REVIEWING', 'SELECTED', 'REJECTED'].includes(status)
          ? { status }
          : {}),
      },
      include: {
        vacancy: { select: { id: true, title: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: applications.map((a) => ({
        ...a,
        status: a.status.toLowerCase(),
      })),
    });
  } catch (error) {
    console.error('List applications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load applications',
    });
  }
};

const adminUpdateApplication = async (req, res) => {
  try {
    await ensureCareersTables();
    const id = parseInt(req.params.id, 10);
    const { status, adminNotes } = req.body;

    const data = {};
    if (status !== undefined) {
      const upper = String(status).toUpperCase();
      if (!['PENDING', 'REVIEWING', 'SELECTED', 'REJECTED'].includes(upper)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      data.status = upper;
    }
    if (adminNotes !== undefined) data.adminNotes = adminNotes || null;

    const application = await prisma.jobApplication.update({
      where: { id },
      data,
      include: { vacancy: { select: { id: true, title: true } } },
    });

    res.json({
      success: true,
      data: { ...application, status: application.status.toLowerCase() },
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update application',
    });
  }
};

/** Stream CV / other docs with auth so admin can open PDF even when /uploads is blocked. */
const adminDownloadApplicationFile = async (req, res) => {
  try {
    await ensureCareersTables();
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const which = String(req.params.which || 'cv').toLowerCase();
    const application = await prisma.jobApplication.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const stored =
      which === 'other' || which === 'docs' || which === 'otherdocs'
        ? application.otherDocsUrl
        : application.cvUrl;

    if (!stored) {
      return res.status(404).json({ success: false, message: 'No file on this application' });
    }

    const resolved = resolveUploadPath(stored);
    if (!resolved || !fs.existsSync(resolved.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File missing on server (upload may have been deleted)',
      });
    }

    const type = contentTypeFor(resolved.filename);
    res.setHeader('Content-Type', type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${resolved.filename.replace(/"/g, '')}"`
    );
    res.setHeader('Cache-Control', 'private, no-store');
    fs.createReadStream(resolved.filePath).pipe(res);
  } catch (error) {
    console.error('Download application file error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to open file',
      });
    }
  }
};

module.exports = {
  getOpenVacancies,
  getOpenVacancy,
  applyToVacancy,
  adminListVacancies,
  adminCreateVacancy,
  adminUpdateVacancy,
  adminDeleteVacancy,
  adminListApplications,
  adminUpdateApplication,
  adminDownloadApplicationFile,
};
