import PublicShell from './PublicShell';
import { navigate } from './navigate';
import { type ServiceDef, SERVICES } from './servicesData';
import { useI18n, type I18nKey } from './i18n/I18nContext';
import './AboutPage.css';
import './ServicesPage.css';

interface ServicesPageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  services?: ServiceDef[];
}

const TITLE_KEY: Record<string, I18nKey> = {
  'road-construction': 'services.roads',
  'building-construction': 'services.building',
  'water-works': 'services.water',
  'electro-mechanical': 'services.electro',
  'machinery-rental': 'services.machinery',
  corridors: 'services.corridors',
};

const LEAD_KEY: Record<string, I18nKey> = {
  'road-construction': 'services.roadsLead',
  'building-construction': 'services.buildingLead',
  'water-works': 'services.waterLead',
  'electro-mechanical': 'services.electroLead',
  'machinery-rental': 'services.machineryLead',
  corridors: 'services.corridorsLead',
};

export default function ServicesPage({ isDarkTheme, toggleTheme, services }: ServicesPageProps) {
  const { t } = useI18n();
  const list = services && services.length > 0 ? services : SERVICES;

  const process = [
    { step: '01', title: t('services.step1'), text: t('services.step1Text') },
    { step: '02', title: t('services.step2'), text: t('services.step2Text') },
    { step: '03', title: t('services.step3'), text: t('services.step3Text') },
    { step: '04', title: t('services.step4'), text: t('services.step4Text') },
  ];

  return (
    <PublicShell active="services" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} services={list}>
      <div className="services-page">
        <header className="page-hero">
          <div className="page-hero-bg" />
          <div className="container page-hero-inner">
            <span className="page-kicker">{t('services.kicker')}</span>
            <h1>{t('services.heroTitle')}</h1>
            <p>{t('services.heroSubtitle')}</p>
          </div>
        </header>

        <section className="svc-list">
          <div className="container">
            <div className="svc-grid">
              {list.map((svc, i) => (
                <button
                  key={svc.slug}
                  type="button"
                  className="svc-col reveal-up"
                  style={{ transitionDelay: `${i * 0.07}s` }}
                  onClick={() => navigate(`/services/${svc.slug}`)}
                >
                  <div className="svc-col-top">
                    <span className="svc-index">{svc.index}</span>
                    <span className="svc-arrow" aria-hidden>
                      →
                    </span>
                  </div>
                  <h3>{TITLE_KEY[svc.slug] ? t(TITLE_KEY[svc.slug]) : svc.title}</h3>
                  <p className="svc-lead">{LEAD_KEY[svc.slug] ? t(LEAD_KEY[svc.slug]) : svc.lead}</p>
                  <ul className="svc-points">
                    {svc.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <span className="svc-col-cta">{t('common.viewDetails')}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="process-section">
          <div className="container">
            <div className="reveal-up" style={{ marginBottom: '2.5rem' }}>
              <h2 className="section-title">{t('services.processTitle')}</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>{t('services.processSubtitle')}</p>
            </div>
            <div className="process-grid">
              {process.map((p, i) => (
                <div key={p.step} className="process-step reveal-up" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span>{p.step}</span>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="container">
            <div className="about-cta-band reveal-up">
              <div>
                <h2>{t('services.ctaTitle')}</h2>
                <p>{t('services.ctaBody')}</p>
              </div>
              <button type="button" className="btn btn-primary" style={{ color: '#000' }} onClick={() => navigate('/contact')}>
                {t('common.contactUs')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
