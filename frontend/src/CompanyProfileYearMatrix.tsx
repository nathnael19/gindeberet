type YearMatrix = {
  calendarNote?: string;
  years: number[];
  rows: { key: string; label: string; counts: number[] }[];
  projectCountTotals: number[];
  totalCost: string[];
};

export default function CompanyProfileYearMatrix({ matrix }: { matrix: YearMatrix | null }) {
  if (!matrix?.years?.length) return null;

  return (
    <section className="cp-matrix">
      <div className="cp-matrix-head">
        <h2>Projects by type and year</h2>
        {matrix.calendarNote && <p>{matrix.calendarNote}</p>}
      </div>
      <div className="cp-table-wrap">
        <table className="cp-table cp-matrix-table">
          <thead>
            <tr>
              <th>Type / Year</th>
              {matrix.years.map((y) => (
                <th key={y} className="cp-matrix-num">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <strong>{row.label}</strong>
                </td>
                {row.counts.map((n, i) => (
                  <td key={`${row.key}-${matrix.years[i]}`} className="cp-matrix-num">
                    {n}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="cp-matrix-subtotal">
              <td>
                <strong>Total projects</strong>
              </td>
              {matrix.projectCountTotals.map((n, i) => (
                <td key={`tot-${matrix.years[i]}`} className="cp-matrix-num">
                  <strong>{n}</strong>
                </td>
              ))}
            </tr>
            <tr className="cp-matrix-cost">
              <td>
                <strong>TOTAL PROJECT COST</strong>
              </td>
              {matrix.totalCost.map((c, i) => (
                <td key={`cost-${matrix.years[i]}`} className="cp-matrix-num cp-num">
                  {c}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
