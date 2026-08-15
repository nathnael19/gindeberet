import { useEffect, useMemo, useState, type FormEvent } from 'react';
import AdminLayout from './AdminLayout';
import { careersApi } from './api';
import { BACKEND_BASE_URL } from './imageUrl';
import './AdminDashboard.css';
import './AdminCareers.css';

interface AdminCareersProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

type Tab = 'vacancies' | 'applications';

const emptyVacancy = {
  title: '',
  department: '',
  location: 'Addis Ababa',
  employmentType: 'Full-time',
  description: '',
  requirements: '',
  deadline: '',
  status: 'open',
};

function tomorrowDateInput() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const fileUrl = (path: string) => {
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

export default function AdminCareers({ isDarkTheme, toggleTheme }: AdminCareersProps) {
  const [tab, setTab] = useState<Tab>('vacancies');
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [form, setForm] = useState(emptyVacancy);
  const [message, setMessage] = useState('');
  const [filterVacancyId, setFilterVacancyId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [appNotes, setAppNotes] = useState('');

  const stats = useMemo(() => {
    const open = vacancies.filter((v) => v.status === 'open').length;
    const closed = vacancies.filter((v) => v.status === 'closed').length;
    const apps = applications.length;
    const pending = applications.filter((a) => a.status === 'pending' || a.status === 'reviewing').length;
    return { open, closed, apps, pending };
  }, [vacancies, applications]);

  const loadVacancies = async () => {
    const res = await careersApi.adminListVacancies();
    if (res.success) setVacancies(res.data);
  };

  const loadApplications = async () => {
    const res = await careersApi.adminListApplications({
      vacancyId: filterVacancyId || undefined,
      status: filterStatus || undefined,
    });
    if (res.success) setApplications(res.data);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      await loadVacancies();
      await loadApplications();
      setMessage('');
    } catch (e: any) {
      console.error(e);
      setMessage(e?.message || 'Failed to load careers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (tab === 'applications') {
      loadApplications().catch(console.error);
    }
  }, [tab, filterVacancyId, filterStatus]);

  const startCreate = () => {
    setEditing(true);
    setCurrent(null);
    setForm(emptyVacancy);
    setMessage('');
  };

  const startEdit = (v: any) => {
    setEditing(true);
    setCurrent(v);
    setForm({
      title: v.title || '',
      department: v.department || '',
      location: v.location || '',
      employmentType: v.employmentType || 'Full-time',
      description: v.description || '',
      requirements: v.requirements || '',
      deadline: v.deadline ? String(v.deadline).slice(0, 10) : '',
      status: v.status || 'open',
    });
    setMessage('');
  };

  const saveVacancy = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (form.status === 'open') {
        if (!form.deadline) {
          setMessage('Deadline is required for open vacancies');
          return;
        }
        const existingDay = current?.deadline ? String(current.deadline).slice(0, 10) : '';
        const unchanged = Boolean(existingDay && existingDay === form.deadline);
        if (!unchanged && form.deadline < tomorrowDateInput()) {
          setMessage('Deadline must be after today');
          return;
        }
      }
      const payload = {
        ...form,
        deadline: form.deadline || null,
      };
      if (current?.id) {
        await careersApi.adminUpdateVacancy(current.id, payload);
        setMessage('Vacancy updated');
      } else {
        await careersApi.adminCreateVacancy(payload);
        setMessage('Vacancy created');
      }
      setEditing(false);
      await loadVacancies();
    } catch (err: any) {
      setMessage(err?.message || 'Save failed');
    }
  };

  const deleteVacancy = async (id: number) => {
    if (!confirm('Delete this vacancy and all its applications?')) return;
    try {
      await careersApi.adminDeleteVacancy(id);
      await refresh();
      setMessage('Vacancy deleted');
    } catch (err: any) {
      setMessage(err?.message || 'Delete failed');
    }
  };

  const openApplication = (app: any) => {
    setSelectedApp(app);
    setAppNotes(app.adminNotes || '');
  };

  const updateApplicationStatus = async (status: string) => {
    if (!selectedApp) return;
    try {
      const res = await careersApi.adminUpdateApplication(selectedApp.id, {
        status,
        adminNotes: appNotes,
      });
      if (res.success) {
        setSelectedApp(res.data);
        await loadApplications();
        setMessage(`Application marked as ${status}`);
      }
    } catch (err: any) {
      setMessage(err?.message || 'Update failed');
    }
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="careers">
      <div className="dashboard-content" style={{ overflow: 'auto', padding: '2rem' }}>
        <div className="admin-careers-page">
          <div className="careers-head">
            <div>
              <h1>Careers</h1>
              <p>Post open roles and review applications with CVs in one place.</p>
            </div>
            {tab === 'vacancies' && !editing && (
              <button type="button" className="btn btn-primary" style={{ color: '#000' }} onClick={startCreate}>
                + New vacancy
              </button>
            )}
          </div>

          <div className="careers-kpis">
            <div className="careers-kpi">
              <span>Open roles</span>
              <strong>{stats.open}</strong>
            </div>
            <div className="careers-kpi">
              <span>Closed</span>
              <strong>{stats.closed}</strong>
            </div>
            <div className="careers-kpi">
              <span>Applications</span>
              <strong>{stats.apps}</strong>
            </div>
            <div className="careers-kpi">
              <span>In review</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="careers-tabs" role="tablist">
            <button
              type="button"
              className={`careers-tab${tab === 'vacancies' ? ' is-active' : ''}`}
              onClick={() => {
                setTab('vacancies');
                setEditing(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h10M4 17h7" />
              </svg>
              Vacancies
              <span className="count">{vacancies.length}</span>
            </button>
            <button
              type="button"
              className={`careers-tab${tab === 'applications' ? ' is-active' : ''}`}
              onClick={() => setTab('applications')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" />
                <path d="M14 3v6h6" />
              </svg>
              Applications
              <span className="count">{applications.length}</span>
            </button>
          </div>

          {message && <p className="careers-msg">{message}</p>}

          {loading ? (
            <p className="careers-loading">Loading careers…</p>
          ) : tab === 'vacancies' ? (
            editing ? (
              <form onSubmit={saveVacancy} className="careers-card">
                <h2 className="careers-card-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  {current ? 'Edit vacancy' : 'New vacancy'}
                </h2>
                <div className="careers-form-grid">
                  <div className="careers-field">
                    <label>Title *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Site Engineer"
                    />
                  </div>
                  <div className="careers-form-row cols-2">
                    <div className="careers-field">
                      <label>Department</label>
                      <input
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        placeholder="Engineering"
                      />
                    </div>
                    <div className="careers-field">
                      <label>Location</label>
                      <input
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="careers-form-row cols-3">
                    <div className="careers-field">
                      <label>Employment type</label>
                      <select
                        value={form.employmentType}
                        onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                      >
                        <option>Full-time</option>
                        <option>Part-time</option>
                        <option>Contract</option>
                        <option>Internship</option>
                      </select>
                    </div>
                    <div className="careers-field">
                      <label>Deadline *</label>
                      <input
                        type="date"
                        required={form.status === 'open'}
                        min={
                          current?.deadline && String(current.deadline).slice(0, 10) === form.deadline
                            ? form.deadline || tomorrowDateInput()
                            : tomorrowDateInput()
                        }
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      />
                      <small style={{ opacity: 0.7 }}>Must be after today. Hidden from public when the date passes.</small>
                    </div>
                    <div className="careers-field">
                      <label>Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="careers-field">
                    <label>Description *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Role overview and responsibilities"
                    />
                  </div>
                  <div className="careers-field">
                    <label>Requirements</label>
                    <textarea
                      rows={4}
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                      placeholder="Skills, experience, qualifications"
                    />
                  </div>
                </div>
                <div className="careers-actions">
                  <button type="submit" className="btn btn-primary" style={{ color: '#000' }}>
                    Save vacancy
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : vacancies.length === 0 ? (
              <div className="admin-careers-empty">
                <strong>No vacancies yet</strong>
                Create your first open role to start receiving applications.
                <div style={{ marginTop: '1rem' }}>
                  <button type="button" className="btn btn-primary" style={{ color: '#000' }} onClick={startCreate}>
                    + New vacancy
                  </button>
                </div>
              </div>
            ) : (
              <div className="careers-vacancy-list">
                {vacancies.map((v) => (
                  <article key={v.id} className="careers-vacancy">
                    <div>
                      <h3>{v.title}</h3>
                      <div className="careers-meta">
                        <span className={`careers-badge ${v.status === 'open' ? 'open' : 'closed'}`}>{v.status}</span>
                        {v.department && <span className="careers-chip">{v.department}</span>}
                        {v.location && <span className="careers-chip">{v.location}</span>}
                        {v.employmentType && <span className="careers-chip">{v.employmentType}</span>}
                        {v.deadline && (
                          <span className="careers-chip">
                            Due {new Date(v.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="careers-vacancy-aside">
                      <div className="careers-apps-count">
                        <strong>{v.applicationsCount ?? 0}</strong> apps
                      </div>
                      <div className="careers-row-actions">
                        <button type="button" className="careers-btn-ghost" onClick={() => startEdit(v)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="careers-btn-ghost"
                          onClick={() => {
                            setTab('applications');
                            setFilterVacancyId(String(v.id));
                          }}
                        >
                          View apps
                        </button>
                        <button type="button" className="careers-btn-ghost danger" onClick={() => deleteVacancy(v.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <div>
              <div className="careers-filters">
                <select value={filterVacancyId} onChange={(e) => setFilterVacancyId(e.target.value)}>
                  <option value="">All vacancies</option>
                  {vacancies.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className={`careers-apps-layout${selectedApp ? ' has-detail' : ''}`}>
                <div className="careers-app-list">
                  {applications.length === 0 ? (
                    <div className="admin-careers-empty">
                      <strong>No applications found</strong>
                      Adjust filters or wait for new submissions.
                    </div>
                  ) : (
                    applications.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={`careers-app-item${selectedApp?.id === a.id ? ' is-active' : ''}`}
                        onClick={() => openApplication(a)}
                      >
                        <div>
                          <h4>{a.fullName}</h4>
                          <p>
                            {a.email}
                            {a.vacancy?.title ? ` · ${a.vacancy.title}` : ''}
                          </p>
                        </div>
                        <span className={`careers-badge ${a.status || 'pending'}`}>{a.status}</span>
                      </button>
                    ))
                  )}
                </div>

                {selectedApp && (
                  <div className="careers-card careers-detail">
                    <h3>{selectedApp.fullName}</h3>
                    <p className="role">{selectedApp.vacancy?.title || '—'}</p>
                    <div className="careers-detail-meta">
                      <div>
                        <strong>Email</strong>
                        {selectedApp.email}
                      </div>
                      {selectedApp.phone && (
                        <div>
                          <strong>Phone</strong>
                          {selectedApp.phone}
                        </div>
                      )}
                      <div>
                        <strong>Status</strong>
                        <span className={`careers-badge ${selectedApp.status || 'pending'}`}>{selectedApp.status}</span>
                      </div>
                    </div>

                    {selectedApp.coverLetter && (
                      <div className="careers-cover">
                        <strong>Cover letter</strong>
                        <p>{selectedApp.coverLetter}</p>
                      </div>
                    )}

                    <div className="careers-actions" style={{ marginTop: 0 }}>
                      <a
                        className="btn btn-primary"
                        style={{ color: '#000' }}
                        href={fileUrl(selectedApp.cvUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open CV
                      </a>
                      {selectedApp.otherDocsUrl && (
                        <a
                          className="btn btn-outline"
                          href={fileUrl(selectedApp.otherDocsUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Other docs
                        </a>
                      )}
                    </div>

                    <div className="careers-field" style={{ marginTop: '1.25rem' }}>
                      <label>Admin notes</label>
                      <textarea rows={3} value={appNotes} onChange={(e) => setAppNotes(e.target.value)} />
                    </div>

                    <div className="careers-actions">
                      <button type="button" className="btn btn-outline" onClick={() => updateApplicationStatus('reviewing')}>
                        Mark reviewing
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ color: '#000' }}
                        onClick={() => updateApplicationStatus('selected')}
                      >
                        Select
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => updateApplicationStatus('rejected')}>
                        Reject
                      </button>
                      <button type="button" className="careers-btn-ghost" onClick={() => setSelectedApp(null)}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
