const prisma = require('../config/database');

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

// Public: list open vacancies
const getOpenVacancies = async (req, res) => {
  try {
    const vacancies = await prisma.jobVacancy.findMany({
      where: { status: 'OPEN' },
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
  } catch (error) {
    console.error('Get open vacancies error:', error);
    res.status(500).json({ success: false, message: 'Failed to load vacancies' });
  }
};

// Public: single open vacancy
const getOpenVacancy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const vacancy = await prisma.jobVacancy.findFirst({
      where: { id, status: 'OPEN' },
    });
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'Vacancy not found' });
    }
    res.json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Get vacancy error:', error);
    res.status(500).json({ success: false, message: 'Failed to load vacancy' });
  }
};

// Public: apply
const applyToVacancy = async (req, res) => {
  try {
    const vacancyId = parseInt(req.params.id, 10);
    const { fullName, email, phone, coverLetter, cvUrl, otherDocsUrl } = req.body;

    if (!fullName || !email || !cvUrl) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and CV are required',
      });
    }

    const vacancy = await prisma.jobVacancy.findFirst({
      where: { id: vacancyId, status: 'OPEN' },
    });
    if (!vacancy) {
      return res.status(404).json({ success: false, message: 'This vacancy is not open for applications' });
    }

    if (vacancy.deadline && new Date(vacancy.deadline) < new Date()) {
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
    res.status(500).json({ success: false, message: 'Failed to submit application' });
  }
};

// Admin: list all vacancies
const adminListVacancies = async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: 'Failed to load vacancies' });
  }
};

const adminCreateVacancy = async (req, res) => {
  try {
    const { title, department, location, employmentType, description, requirements, deadline, status } =
      req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const vacancy = await prisma.jobVacancy.create({
      data: {
        title: String(title).trim(),
        department: department || null,
        location: location || null,
        employmentType: employmentType || null,
        description: String(description).trim(),
        requirements: requirements || null,
        deadline: deadline ? new Date(deadline) : null,
        status: status === 'closed' || status === 'CLOSED' ? 'CLOSED' : 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Create vacancy error:', error);
    res.status(500).json({ success: false, message: 'Failed to create vacancy' });
  }
};

const adminUpdateVacancy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, department, location, employmentType, description, requirements, deadline, status } =
      req.body;

    const data = {};
    if (title !== undefined) data.title = String(title).trim();
    if (department !== undefined) data.department = department || null;
    if (location !== undefined) data.location = location || null;
    if (employmentType !== undefined) data.employmentType = employmentType || null;
    if (description !== undefined) data.description = String(description).trim();
    if (requirements !== undefined) data.requirements = requirements || null;
    if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
    if (status !== undefined) {
      data.status = status === 'closed' || status === 'CLOSED' ? 'CLOSED' : 'OPEN';
    }

    const vacancy = await prisma.jobVacancy.update({ where: { id }, data });
    res.json({ success: true, data: toPublicVacancy(vacancy) });
  } catch (error) {
    console.error('Update vacancy error:', error);
    res.status(500).json({ success: false, message: 'Failed to update vacancy' });
  }
};

const adminDeleteVacancy = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.jobVacancy.delete({ where: { id } });
    res.json({ success: true, message: 'Vacancy deleted' });
  } catch (error) {
    console.error('Delete vacancy error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete vacancy' });
  }
};

// Admin: applications
const adminListApplications = async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: 'Failed to load applications' });
  }
};

const adminUpdateApplication = async (req, res) => {
  try {
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
    res.status(500).json({ success: false, message: 'Failed to update application' });
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
};
