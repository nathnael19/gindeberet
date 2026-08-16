/**
 * Summary matrix from gindeberet Company Profile 2026.xlsx (Sheet4 / Sheet1).
 * Years follow the sheet columns 2009–2017.
 */
const MATRIX_YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017];

const MATRIX_ROWS = [
  {
    key: 'llrp',
    label: 'LLRP project',
    counts: [0, 0, 0, 0, 1, 2, 2, 0, 1],
  },
  {
    key: 'subcontract',
    label: 'Sub contract',
    counts: [0, 2, 1, 1, 2, 2, 0, 0, 1],
  },
  {
    key: 'road',
    label: 'Road project',
    counts: [1, 1, 0, 0, 1, 1, 3, 1, 2],
  },
  {
    key: 'bridge',
    label: 'Bridge construction',
    counts: [0, 0, 0, 1, 0, 1, 0, 0, 1],
  },
  {
    key: 'irrigation',
    label: 'Small scale irrigation',
    counts: [0, 0, 0, 0, 0, 0, 0, 0, 1],
  },
  {
    key: 'building',
    label: 'Building G+0 up to G+4',
    counts: [1, 4, 1, 1, 1, 2, 3, 5, 1],
  },
];

/** TOTAL PROJECT COST (ETB) — Sheet4 values; 2014 was #REF! on the sheet */
const MATRIX_TOTAL_COST = [
  54170925.0,
  79068346.71,
  22357873.82,
  32439043.41,
  14507808.71,
  null,
  314074675.5,
  180682458.14,
  2824025429.86,
];

function formatEtb(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getYearMatrix() {
  const rows = MATRIX_ROWS.map((r) => ({
    key: r.key,
    label: r.label,
    counts: r.counts.slice(),
    byYear: Object.fromEntries(MATRIX_YEARS.map((y, i) => [y, r.counts[i] ?? 0])),
  }));

  const projectCountTotals = MATRIX_YEARS.map((_, i) =>
    MATRIX_ROWS.reduce((sum, r) => sum + (r.counts[i] || 0), 0)
  );

  return {
    calendarNote: 'From company profile sheet — projects by type and year (2009–2017).',
    years: MATRIX_YEARS.slice(),
    rows,
    projectCountTotals,
    totalCost: MATRIX_TOTAL_COST.map(formatEtb),
    totalCostRaw: MATRIX_TOTAL_COST.slice(),
  };
}

module.exports = {
  MATRIX_YEARS,
  MATRIX_ROWS,
  MATRIX_TOTAL_COST,
  getYearMatrix,
  formatEtb,
};
