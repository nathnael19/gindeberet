const prisma = require('../config/database');

const getModel = (section) => {
  switch (section) {
    case 'partners': return prisma.partner;
    case 'safety': return prisma.safetyFeature;
    case 'testimonials': return prisma.testimonial;
    case 'team': return prisma.teamMember;
    case 'awards': return prisma.award;
    case 'news': return prisma.newsItem;
    default: return null;
  }
};

const getAll = async (req, res) => {
  const model = getModel(req.params.section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    const data = await model.findMany();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  const model = getModel(req.params.section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    const data = await model.create({ data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  const model = getModel(req.params.section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    const data = await model.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  const model = getModel(req.params.section);
  if (!model) return res.status(400).json({ success: false, message: 'Invalid section' });
  try {
    await model.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, create, update, remove };
