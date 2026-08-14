import { useEffect, useState, type FormEvent } from 'react';
import PublicShell from './PublicShell';
import { careersApi, uploadApi } from './api';
import { useI18n } from './i18n/I18nContext';
import './AboutPage.css';
import './CareersPage.css';

interface CareersPageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

interface Vacancy {
  id: number;
  title: string;
  department?: string;
  location?: string;
  employmentType?: string;
  description: string;
  requirements?: string;
  deadline?: string | null;
}

const emptyForm = {
  fullName: '',
  email: '',
  phone: '',
  coverLetter: '',
};

export default function CareersPage({ isDarkTheme, toggleTheme }: CareersPageProps) {
  const { t } = useI18n();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Vacancy | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [otherFile, setOtherFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    careersApi
      .getOpenVacancies()
      .then((res) => {
        if (res.success) setVacancies(res.data);
      })
      .catch(() => setError('failed'))
      .finally(() => setLoading(false));
  }, []);

  const openApply = (vacancy: Vacancy) => {
    setSelected(vacancy);
    setForm(emptyForm);
    setCvFile(null);
    setOtherFile(null);
    setFormError('');
    setSubmitted(false);
  };

  const closeApply = () => {
    if (submitting) return;
    setSelected(null);
    setSubmitted(false);
  };

  const submitApplication = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setFormError('');

    if (!cvFile) {
      setFormError(t('careers.needCv'));
      return;
    }

    try {
      setSubmitting(true);
      const cvUpload = await uploadApi.uploadDocument(cvFile);
      let otherDocsUrl: string | undefined;
      if (otherFile) {
        const otherUpload = await uploadApi.uploadDocument(otherFile);
        otherDocsUrl = otherUpload.data.url;
      }

      await careersApi.apply(selected.id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
        cvUrl: cvUpload.data.url,
        otherDocsUrl,
      });

      setForm(emptyForm);
      setCvFile(null);
      setOtherFile(null);
      setSubmitted(true);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (/already submitted/i.test(msg)) {
        setFormError(t('careers.alreadyApplied'));
      } else {
        setFormError(msg || t('careers.failedSubmit'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicShell active="careers" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}>
      <div className="careers-page">
        <header className="page-hero">
          <div className="page-hero-bg" />
          <div className="container page-hero-inner">
            <span className="page-kicker">{t('careers.kicker')}</span>
            <h1>{t('careers.heroTitle')}</h1>
            <p>{t('careers.heroSubtitle')}</p>
          </div>
        </header>

        <section className="careers-body">
          <div className="container">
            <div className="reveal-up" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title">{t('careers.openTitle')}</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {t('careers.openSubtitle')}
              </p>
            </div>

            {loading ? (
              <p style={{ color: 'var(--text-muted)' }}>{t('careers.loading')}</p>
            ) : error ? (
              <p style={{ color: '#dc2626' }}>{t('careers.failed')}</p>
            ) : vacancies.length === 0 ? (
              <div className="careers-empty">{t('careers.empty')}</div>
            ) : (
              <div className="vacancy-grid">
                {vacancies.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    className="vacancy-col reveal-up"
                    style={{ transitionDelay: `${i * 0.07}s` }}
                    onClick={() => openApply(v)}
                  >
                    <div className="vacancy-col-top">
                      <span className="vacancy-index">{String(i + 1).padStart(2, '0')}</span>
                      <span className="vacancy-arrow" aria-hidden>
                        →
                      </span>
                    </div>
                    <h3>{v.title}</h3>
                    <ul className="vacancy-meta">
                      {v.department && <li>{v.department}</li>}
                      {v.location && <li>{v.location}</li>}
                      {v.employmentType && <li>{v.employmentType}</li>}
                      {v.deadline && (
                        <li>
                          {t('careers.deadline')}: {new Date(v.deadline).toLocaleDateString()}
                        </li>
                      )}
                    </ul>
                    <span className="vacancy-cta">{t('common.apply')}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {selected && (
        <div className="apply-modal-backdrop" onClick={closeApply}>
          <div
            className="apply-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Apply for ${selected.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="apply-success-panel">
                <div className="apply-success-icon" aria-hidden>
                  ✓
                </div>
                <h2>{t('careers.successTitle')}</h2>
                <p className="apply-role">{selected.title}</p>
                <p className="apply-success-text">{t('careers.success')}</p>
                <div className="apply-actions">
                  <button type="button" className="btn btn-primary" style={{ color: '#000' }} onClick={closeApply}>
                    {t('careers.done')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>{t('careers.applyNow')}</h2>
                <p className="apply-role">{selected.title}</p>

                <div className="apply-detail">
                  <strong style={{ color: 'var(--text-main)' }}>{t('careers.aboutRole')}</strong>
                  <br />
                  {selected.description}
                  {selected.requirements && (
                    <>
                      <br />
                      <br />
                      <strong style={{ color: 'var(--text-main)' }}>{t('careers.requirements')}</strong>
                      <br />
                      {selected.requirements}
                    </>
                  )}
                </div>

                <form onSubmit={submitApplication}>
                  <div className="form-group">
                    <label>{t('careers.fullName')}</label>
                    <input
                      className="form-control"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('careers.email')}</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('careers.phone')}</label>
                    <input
                      className="form-control"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('careers.coverLetter')}</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.coverLetter}
                      onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('careers.cv')}</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf"
                      required
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                    {cvFile && <div className="file-name">{cvFile.name}</div>}
                  </div>
                  <div className="form-group">
                    <label>{t('careers.otherDocs')}</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => setOtherFile(e.target.files?.[0] || null)}
                    />
                    {otherFile && <div className="file-name">{otherFile.name}</div>}
                  </div>

                  {formError && <p className="apply-error">{formError}</p>}

                  <div className="apply-actions">
                    <button type="submit" className="btn btn-primary" style={{ color: '#000' }} disabled={submitting}>
                      {submitting ? t('careers.submitting') : t('careers.submit')}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={closeApply} disabled={submitting}>
                      {t('common.close')}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </PublicShell>
  );
}
