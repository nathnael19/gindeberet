import { useEffect, useState } from 'react';
import PublicShell from './PublicShell';
import { landingApi } from './api';
import { getImageUrl } from './imageUrl';
import { navigate } from './navigate';
import { useI18n } from './i18n/I18nContext';
import './AboutPage.css';

interface AboutPageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  completedProjectsCount?: number;
}

export default function AboutPage({ isDarkTheme, toggleTheme, completedProjectsCount = 0 }: AboutPageProps) {
  const { t } = useI18n();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      landingApi.getSection('team').catch(() => ({ success: false, data: [] })),
      landingApi.getSection('facilities').catch(() => ({ success: false, data: [] })),
    ]).then(([teamRes, facilitiesRes]) => {
      if (teamRes.success) setTeamMembers(teamRes.data || []);
      if (facilitiesRes.success) setFacilities(facilitiesRes.data || []);
    });
  }, []);

  const fallbackFacilities = [
    {
      id: 'f1',
      title: t('about.officeHead'),
      description: t('about.officeHeadText'),
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'f2',
      title: t('about.officePlanning'),
      description: t('about.officePlanningText'),
      imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f3',
      title: t('about.officeYard'),
      description: t('about.officeYardText'),
      imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f4',
      title: t('about.officeStore'),
      description: t('about.officeStoreText'),
      imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f5',
      title: t('about.officeSite'),
      description: t('about.officeSiteText'),
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    },
  ];

  const officeGallery = facilities.length > 0 ? facilities : fallbackFacilities;

  const values = [
    { num: '01', title: t('about.value1Title'), text: t('about.value1Text') },
    { num: '02', title: t('about.value2Title'), text: t('about.value2Text') },
    { num: '03', title: t('about.value3Title'), text: t('about.value3Text') },
    { num: '04', title: t('about.value4Title'), text: t('about.value4Text') },
    { num: '05', title: t('about.value5Title'), text: t('about.value5Text') },
  ];

  const profileServices = [
    { title: t('about.svc1Title'), text: t('about.svc1Text') },
    { title: t('about.svc2Title'), text: t('about.svc2Text') },
    { title: t('about.svc3Title'), text: t('about.svc3Text') },
    { title: t('about.svc4Title'), text: t('about.svc4Text') },
    { title: t('about.svc5Title'), text: t('about.svc5Text') },
    { title: t('about.svc6Title'), text: t('about.svc6Text') },
  ];

  return (
    <PublicShell active="about" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}>
      <header className="page-hero">
        <div className="page-hero-bg" />
        <div className="container page-hero-inner">
          <span className="page-kicker">{t('about.kicker')}</span>
          <h1>{t('about.heroTitle')}</h1>
          <p>{t('about.heroSubtitle')}</p>
        </div>
      </header>

      <section className="about-story">
        <div className="container about-story-grid">
          <div className="reveal-up">
            <h2 className="section-title">{t('about.whoTitle')}</h2>
            <p className="section-subtitle" style={{ marginTop: '1.25rem', color: 'var(--text-main)' }}>
              {t('about.whoLead')}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{t('about.whoBody1')}</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('about.whoBody2')}</p>
            <div className="stats-container">
              <div className="stat-item">
                <h3>
                  {completedProjectsCount}
                  <span>+</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('homeAbout.completed')}</p>
              </div>
              <div className="stat-item">
                <h3>
                  2012<span />
                </h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('about.established')}</p>
              </div>
              <div className="stat-item">
                <h3>
                  14<span>{t('homeAbout.years')}</span>
                </h3>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t('homeAbout.experience')}</p>
              </div>
            </div>
          </div>
          <div className="about-story-media reveal-up" style={{ transitionDelay: '0.15s' }}>
            <img
              src="/images/about-general.png"
              alt="Gindeberet survey and construction team on site"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1541888087425-ce81dc8ca664?auto=format&fit=crop&w=1000&q=80';
              }}
            />
            <div className="about-story-accent" aria-hidden />
          </div>
        </div>
      </section>

      <section className="about-motto">
        <div className="container">
          <blockquote className="about-motto-card reveal-up">
            <p>“{t('about.motto')}”</p>
            <cite>{t('about.mottoBy')}</cite>
          </blockquote>
        </div>
      </section>

      <section className="vm-section">
        <div className="container">
          <div className="reveal-up" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">{t('about.vmTitle')}</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{t('about.vmSubtitle')}</p>
          </div>
          <div className="vm-grid vm-grid--3">
            <article className="vm-card reveal-up">
              <h3>{t('about.vision')}</h3>
              <p>{t('about.visionBody')}</p>
            </article>
            <article className="vm-card reveal-up" style={{ transitionDelay: '0.08s' }}>
              <h3>{t('about.mission')}</h3>
              <p>{t('about.missionBody')}</p>
            </article>
            <article className="vm-card reveal-up" style={{ transitionDelay: '0.16s' }}>
              <h3>{t('about.objective')}</h3>
              <p>{t('about.objectiveBody')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="container">
          <div className="reveal-up" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title">{t('about.valuesTitle')}</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{t('about.valuesSubtitle')}</p>
          </div>
          <div className="values-grid values-grid--5">
            {values.map((v, i) => (
              <div key={v.num} className="value-item reveal-up" style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="value-num">{v.num}</span>
                <h4>{v.title}</h4>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-hse">
        <div className="container about-hse-grid">
          <article className="about-hse-card reveal-up">
            <span className="about-hse-label">{t('about.safetyLabel')}</span>
            <h3>{t('about.safetyTitle')}</h3>
            <p>{t('about.safetyBody')}</p>
            <ul>
              <li>{t('about.safety1')}</li>
              <li>{t('about.safety2')}</li>
              <li>{t('about.safety3')}</li>
              <li>{t('about.safety4')}</li>
            </ul>
          </article>
          <article className="about-hse-card reveal-up" style={{ transitionDelay: '0.1s' }}>
            <span className="about-hse-label">{t('about.qualityLabel')}</span>
            <h3>{t('about.qualityTitle')}</h3>
            <p>{t('about.qualityBody')}</p>
            <ul>
              <li>{t('about.quality1')}</li>
              <li>{t('about.quality2')}</li>
              <li>{t('about.quality3')}</li>
              <li>{t('about.quality4')}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="about-services">
        <div className="container">
          <div className="reveal-up" style={{ marginBottom: '2.25rem' }}>
            <h2 className="section-title">{t('about.servicesTitle')}</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{t('about.servicesSubtitle')}</p>
          </div>
          <div className="about-services-grid">
            {profileServices.map((s, i) => (
              <article key={s.title} className="about-service-item reveal-up" style={{ transitionDelay: `${i * 0.05}s` }}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="reveal-up" style={{ marginTop: '1.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/services')}>
              {t('about.servicesCta')}
            </button>
          </div>
        </div>
      </section>

      <section className="office-section">
        <div className="container">
          <div className="reveal-up" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title">{t('about.officeTitle')}</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>{t('about.officeSubtitle')}</p>
          </div>
          <div className="office-grid reveal-up">
            {officeGallery.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>{t('about.officeEmpty')}</p>
            ) : (
              officeGallery.map((item) => (
                <figure key={item.id || item.title}>
                  <img src={getImageUrl(item.imageUrl || item.src)} alt={item.title} loading="lazy" />
                  <figcaption>
                    <strong>{item.title}</strong>
                    {item.description ? <span>{item.description}</span> : null}
                  </figcaption>
                </figure>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="about-team-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">{t('about.teamTitle')}</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem' }}>{t('about.teamSubtitle')}</p>
          </div>
          <div className="team-grid">
            {teamMembers.length > 0 ? (
              teamMembers.map((member, i) => (
                <div key={member.id} className="team-card reveal-up" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <img src={getImageUrl(member.imageUrl)} alt={member.name} className="team-image" />
                  <div className="team-info">
                    <h3>{member.name}</h3>
                    <span>{member.position}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>
                {t('about.teamEmpty')}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <div className="about-cta-band reveal-up">
            <div>
              <h2>{t('about.ctaTitle')}</h2>
              <p>{t('about.ctaBody')}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ color: '#000' }}
              onClick={() => navigate('/contact')}
            >
              {t('common.contactUs')}
            </button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
