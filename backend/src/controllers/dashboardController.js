const prisma = require('../config/database');

function parseBudget(budget) {
  if (budget == null) return 0;
  const n = parseFloat(String(budget).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function formatEtb(amount) {
  if (!amount) return 'ETB 0';
  return `ETB ${Math.round(amount).toLocaleString('en-ET')}`;
}

function buildAnalytics(projects) {
  const byYearMap = new Map();
  const byCategoryMap = new Map();
  let totalCapital = 0;
  const status = { ACTIVE: 0, COMPLETED: 0, PENDING: 0 };

  for (const p of projects) {
    const year = String(p.year || 'Unknown').trim() || 'Unknown';
    const category = String(p.category || 'Other').trim() || 'Other';
    const capital = parseBudget(p.budget);
    totalCapital += capital;

    if (status[p.status] !== undefined) status[p.status] += 1;

    const y = byYearMap.get(year) || { year, projects: 0, capital: 0 };
    y.projects += 1;
    y.capital += capital;
    byYearMap.set(year, y);

    const c = byCategoryMap.get(category) || { name: category, projects: 0, capital: 0 };
    c.projects += 1;
    c.capital += capital;
    byCategoryMap.set(category, c);
  }

  const byYear = [...byYearMap.values()].sort((a, b) => {
    const ay = Number(a.year);
    const by = Number(b.year);
    if (Number.isFinite(ay) && Number.isFinite(by)) return ay - by;
    return String(a.year).localeCompare(String(b.year));
  });

  let cumulative = 0;
  const growth = byYear.map((row) => {
    cumulative += row.capital;
    return {
      year: row.year,
      capital: Math.round(row.capital),
      projects: row.projects,
      cumulative: Math.round(cumulative),
    };
  });

  const byCategory = [...byCategoryMap.values()]
    .map((row) => ({
      name: row.name,
      projects: row.projects,
      capital: Math.round(row.capital),
    }))
    .sort((a, b) => b.capital - a.capital);

  const peak = byYear.reduce(
    (best, row) => (row.projects > (best?.projects || 0) ? row : best),
    null
  );

  const totalProjects = projects.length;
  const avgCapital = totalProjects > 0 ? totalCapital / totalProjects : 0;

  return {
    byYear: byYear.map((row) => ({
      year: row.year,
      projects: row.projects,
      capital: Math.round(row.capital),
    })),
    byCategory,
    growth,
    summary: {
      totalProjects,
      totalCapital: Math.round(totalCapital),
      totalCapitalLabel: formatEtb(totalCapital),
      avgCapital: Math.round(avgCapital),
      avgCapitalLabel: formatEtb(avgCapital),
      peakYear: peak?.year || null,
      peakYearProjects: peak?.projects || 0,
      peakYearCapital: peak ? Math.round(peak.capital) : 0,
      peakYearCapitalLabel: peak ? formatEtb(peak.capital) : 'ETB 0',
      byStatus: status,
    },
  };
}

// Legacy monthly series (kept for compatibility) — now driven by project year capital share
const getRevenueData = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: { budget: true, year: true, status: true },
    });
    const analytics = buildAnalytics(projects);
    const data = analytics.byYear.map((row) => ({
      name: row.year,
      revenue: row.capital,
      projects: row.projects,
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue data',
    });
  }
};

const getKPIData = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: { budget: true, year: true, status: true, category: true },
    });
    const analytics = buildAnalytics(projects);
    const teamMembers = await prisma.adminUser.count({ where: { isActive: true } });

    res.json({
      success: true,
      data: {
        totalRevenue: analytics.summary.totalCapitalLabel,
        totalCapital: analytics.summary.totalCapital,
        totalProjects: analytics.summary.totalProjects,
        avgCapital: analytics.summary.avgCapitalLabel,
        peakYear: analytics.summary.peakYear,
        peakYearProjects: analytics.summary.peakYearProjects,
        teamMembers: teamMembers || null,
        completed: analytics.summary.byStatus.COMPLETED,
        active: analytics.summary.byStatus.ACTIVE,
        pending: analytics.summary.byStatus.PENDING,
      },
    });
  } catch (error) {
    console.error('Get KPI data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching KPI data',
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        budget: true,
        year: true,
        status: true,
        category: true,
        client: true,
      },
      orderBy: { year: 'asc' },
    });

    res.json({
      success: true,
      data: buildAnalytics(projects),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics',
    });
  }
};

module.exports = {
  getRevenueData,
  getKPIData,
  getAnalytics,
};
