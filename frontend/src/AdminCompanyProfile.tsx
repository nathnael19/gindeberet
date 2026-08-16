import { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { companyProfileApi } from './api';
import { SITE_URL } from './seo';
import CompanyProfileYearMatrix from './CompanyProfileYearMatrix';
import './AdminDashboard.css';
import './CompanyProfile.css';

interface AdminCompanyProfileProps {
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
  year: string;
  commencement: string;
  contractPeriod: string;
  progress: string;
  status: string;
  qualityIssues: string;
  socialEnvIssues: string;
  isPublic: boolean;
};

export default function AdminCompanyProfile({ isDarkTheme, toggleTheme }: AdminCompanyProfileProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [yearMatrix, setYearMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [pdfScope, setPdfScope] = useState<'all' | 'public'>('all');

  const shareUrl = `${SITE_URL}/company-profile`;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await companyProfileApi.getAdmin();
      setRows(res.data.rows || []);
      setSummary(res.data.summary || null);
      setYearMatrix(res.data.yearMatrix || null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load company profile');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== 'All' && r.category !== category) return false;
      if (!q) return true;
      return (
        r.projectName.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query, category]);

  const copyShareLink = async () => {
    setMessage('');
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage('Share link copied — anyone can open the public profile table.');
    } catch {
      setMessage(shareUrl);
    }
  };

  const downloadPdf = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await companyProfileApi.downloadAdminPdf(pdfScope);
      setMessage(`PDF downloaded (${pdfScope === 'public' ? 'published only' : 'all projects'}).`);
    } catch (e: any) {
      setError(e?.message || 'PDF download failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="profile">
      <div className="company-profile-page">
        <div className="cp-head">
          <div>
            <p className="cp-kicker">Company profile · 2026</p>
            <h1>Project history table</h1>
            <p>
              Built from your Projects database — download as PDF or share a public link for clients
              and partners.
            </p>
          </div>
          <div className="cp-head-actions">
            <button type="button" className="btn btn-outline" onClick={copyShareLink}>
              Copy share link
            </button>
            <a className="btn btn-outline" href="/company-profile" target="_blank" rel="noopener noreferrer">
              Open public view
            </a>
            <div className="cp-pdf-group">
              <select
                value={pdfScope}
                onChange={(e) => setPdfScope(e.target.value as 'all' | 'public')}
                aria-label="PDF scope"
              >
                <option value="all">PDF: all projects</option>
                <option value="public">PDF: published only</option>
              </select>
              <button
                type="button"
                className="btn btn-primary"
                style={{ color: '#000' }}
                disabled={busy || loading}
                onClick={downloadPdf}
              >
                {busy ? 'Preparing…' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>

        {(error || message) && (
          <p className={`cp-alert${error ? ' is-error' : ''}`}>{error || message}</p>
        )}

        {summary && (
          <div className="cp-kpis">
            <div className="cp-kpi">
              <span>Total projects</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="cp-kpi">
              <span>Completed</span>
              <strong>{summary.completed}</strong>
            </div>
            <div className="cp-kpi">
              <span>Active</span>
              <strong>{summary.active}</strong>
            </div>
            <div className="cp-kpi">
              <span>On public link</span>
              <strong>{rows.filter((r) => r.isPublic).length}</strong>
            </div>
          </div>
        )}

        <div className="cp-toolbar">
          <input
            type="search"
            placeholder="Search name, client, location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="cp-count">
            Showing {filtered.length} of {rows.length}
          </span>
        </div>

        <div className="cp-share-box">
          <strong>Share link</strong>
          <code>{shareUrl}</code>
          <p>
            Public page lists projects marked <em>published on website</em> in Projects. Unpublished
            rows stay admin-only (and in “all projects” PDF).
          </p>
        </div>

        <CompanyProfileYearMatrix matrix={yearMatrix} />

        <div className="cp-table-wrap">
          {loading ? (
            <p className="cp-empty">Loading projects…</p>
          ) : filtered.length === 0 ? (
            <p className="cp-empty">No projects match. Add or publish projects first.</p>
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
                  <th>Web</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{r.projectName}</strong>
                      <span className="cp-meta">
                        {r.id}
                        {r.location ? ` · ${r.location}` : ''}
                      </span>
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
                    <td>{r.isPublic ? 'Yes' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
