const prisma = require('../config/database');

const SECTION_FIELDS = {
  hero: {
    required: ['title1', 'title2', 'line', 'imageUrl'],
    optional: ['sortOrder'],
  },
  services: {
    required: [
      'slug',
      'indexLabel',
      'title',
      'lead',
      'category',
      'points',
      'overview',
      'approach',
      'outcomes',
      'heroImage',
    ],
    optional: ['sortOrder'],
  },
  partners: { required: ['name'], optional: ['logoUrl'] },
  safety: { required: ['title', 'description'], optional: ['icon'] },
  testimonials: { required: ['authorName', 'authorTitle', 'text'], optional: [] },
  team: { required: ['name', 'position'], optional: ['imageUrl'] },
  awards: { required: ['title', 'description', 'icon'], optional: ['imageUrl'] },
  news: {
    required: ['title', 'date', 'excerpt'],
    optional: ['category', 'imageUrl', 'linkUrl', 'sortOrder'],
  },
  facilities: {
    required: ['title', 'imageUrl'],
    optional: ['description', 'sortOrder'],
  },
};

const getModel = (section) => {
  switch (section) {
    case 'hero':
      return prisma.heroSlide;
    case 'services':
      return prisma.service;
    case 'partners':
      return prisma.partner;
    case 'safety':
      return prisma.safetyFeature;
    case 'testimonials':
      return prisma.testimonial;
    case 'team':
      return prisma.teamMember;
    case 'awards':
      return prisma.award;
    case 'news':
      return prisma.newsItem;
    case 'facilities':
      return prisma.officeFacility;
    default:
      return null;
  }
};

const pickFields = (section, body = {}, { partial = false } = {}) => {
  const cfg = SECTION_FIELDS[section];
  if (!cfg) return {};
  const data = {};

  const toLines = (value) => {
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  for (const key of cfg.required) {
    if (body[key] === undefined) {
      if (!partial) data[key] = '';
      continue;
    }
    data[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
  }

  for (const key of cfg.optional) {
    if (body[key] === undefined) continue;
    if (typeof body[key] === 'string') {
      const trimmed = body[key].trim();
      data[key] = trimmed === '' ? null : trimmed;
    } else {
      data[key] = body[key];
    }
  }

  if (section === 'services') {
    for (const listKey of ['points', 'approach', 'outcomes']) {
      if (data[listKey] !== undefined) {
        data[listKey] = toLines(data[listKey]);
      }
    }
  }

  if (data.sortOrder !== undefined && data.sortOrder !== null && data.sortOrder !== '') {
    const n = parseInt(data.sortOrder, 10);
    data.sortOrder = Number.isNaN(n) ? 0 : n;
  } else if (data.sortOrder === '') {
    data.sortOrder = 0;
  }

  if (section === 'news' && !partial && !data.category) {
    data.category = 'news';
  }

  return data;
};

const getAll = async (req, res) => {
  const section = req.params.section;
  const model = getModel(section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    if (section === 'hero' || section === 'services') {
      const { ensureLandingDefaults } = require('../services/ensureLandingDefaults');
      await ensureLandingDefaults();
    }
    const orderBy =
      section === 'news'
        ? [{ sortOrder: 'asc' }, { id: 'desc' }]
        : section === 'hero' || section === 'services' || section === 'facilities'
          ? [{ sortOrder: 'asc' }, { id: 'asc' }]
          : { id: 'asc' };
    const data = await model.findMany({ orderBy });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  const section = req.params.section;
  const model = getModel(section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });

  try {
    const cfg = SECTION_FIELDS[section];
    const data = pickFields(section, req.body);
    const missing = cfg.required.filter((key) => {
      const val = data[key];
      if (Array.isArray(val)) return val.length === 0;
      return val === undefined || val === null || val === '';
    });
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const created = await model.create({ data });
    res.json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  const section = req.params.section;
  const model = getModel(section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });

  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const data = pickFields(section, req.body, { partial: true });
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    const updated = await model.update({ where: { id }, data });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  const section = req.params.section;
  const model = getModel(section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }
    await model.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, create, update, remove };
