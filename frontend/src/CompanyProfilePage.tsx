import { useEffect, useMemo, useState } from 'react';
import PublicShell from './PublicShell';
import { companyProfileApi } from './api';
import { SITE_NAME } from './seo';
import './CompanyProfile.css';

interface CompanyProfilePageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

type Row = {
  no: number;
  id: string;
  projectName: string;
  clientName: string;
  contractor: string;
  contractAmount: string;
  location: string;
  category: string;
  commencement: string;
  contractPeriod: string;
  progress: string;
  status: string;
  qualityIssues: string;
  socialEnvIssues: string;
};

export default function CompanyProfilePage({ isDarkTheme, toggleTheme }: CompanyProfilePageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await companyProfileApi.getPublic();
        setRows(res.data.rows || []);
        setSummary(res.data.summary || null);
      } catch (e: any) {
        setError(e?.message || 'Could not load company profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.projectName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const downloadPdf = async () => {
    setBusy(true);
    setError('');
    try {
      await companyProfileApi.downloadPublicPdf();
    } catch (e: any) {
      setError(e?.message || 'PDF download failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicShell isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}>
      <div className="cp-public">
        <header className="cp-public-hero">
          <p className="cp-kicker">Company profile</p>
          <h1>{SITE_NAME}</h1>
          <p className="cp-public-lead">
            Project history table — contract works delivered and in progress across Ethiopia.
          </p>
          <div className="cp-public-actions">
            <button
              type="button"
              className="btn btn-primary"
              style={{ color: '#000' }}
              disabled={busy || loading || rows.length === 0}
              onClick={downloadPdf}
            >
              {busy ? 'Preparing PDF…' : 'Download PDF'}
            </button>
            {summary && (
              <span className="cp-public-stat">
                {summary.total} projects · {summary.completed} completed · {summary.active} active
              </span>
            )}
          </div>
        </header>

        {error && <p className="cp-alert is-error">{error}</p>}

        <div className="cp-toolbar cp-toolbar--public">
          <input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="cp-table-wrap">
          {loading ? (
            <p className="cp-empty">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="cp-empty">No published projects yet.</p>
          ) : (
            <table className="cp-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Project Name</th>
                  <th>Client Name</th>
                  <th>Contractor</th>
                  <th>Contract Amount (ETB)</th>
                  <th>Year</th>
                  <th>Period</th>
                  <th>Progress</th>
                  <th>Quality</th>
                  <th>Social/Env</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{r.projectName}</strong>
                      {r.location && <span className="cp-meta">{r.location}</span>}
                    </td>
                    <td>{r.clientName}</td>
                    <td>{r.contractor}</td>
                    <td className="cp-num">{r.contractAmount}</td>
                    <td>{r.commencement}</td>
                    <td>{r.contractPeriod}</td>
                    <td>
                      <span className={`cp-pill ${r.status}`}>{r.progress}</span>
                    </td>
                    <td>{r.qualityIssues}</td>
                    <td>{r.socialEnvIssues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
