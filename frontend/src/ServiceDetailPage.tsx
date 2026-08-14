import { useEffect, useState } from 'react';
import PublicShell from './PublicShell';
import ProjectDetail, { type Project } from './ProjectDetail';
import { publicApi } from './api';
import { getImageUrl } from './imageUrl';
import { navigate } from './navigate';
import { getServiceBySlug, type ServiceDef, SERVICES } from './servicesData';
import { useI18n, type I18nKey } from './i18n/I18nContext';
import './AboutPage.css';
import './ServicesPage.css';
import './App.css';

interface ServiceDetailPageProps {
  slug: string;
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

export default function ServiceDetailPage({
  slug,
  isDarkTheme,
  toggleTheme,
  services,
}: ServiceDetailPageProps) {
  const { t, dict } = useI18n();
  const serviceList = services && services.length > 0 ? services : SERVICES;
  const service = getServiceBySlug(slug, serviceList);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!service) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await publicApi.getProjects();
        if (response.success) {
          const mapped = response.data
            .filter((p: any) => (p.category || '').toLowerCase() === service.category.toLowerCase())
            .map((p: any) => ({
              id: p.id,
              title: p.name,
              category: p.category,
              image: getImageUrl(p.image),
              description: p.description || 'No description available.',
              client: p.client,
              location: p.location,
              duration: p.duration,
              value: p.budget,
              year: p.year,
              status: p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : undefined,
              challenge: p.challenge || undefined,
              solution: p.solution || undefined,
              highlights:
                Array.isArray(p.highlights) && p.highlights.length > 0 ? p.highlights : undefined,
              gallery:
                p.gallery && p.gallery.length > 0
                  ? p.gallery.map((url: string) => getImageUrl(url))
                  : p.image
                    ? [getImageUrl(p.image)]
                    : undefined,
            }));
          setProjects(mapped);
        }
      } catch {
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [service]);

  const title = service && TITLE_KEY[service.slug] ? t(TITLE_KEY[service.slug]) : service?.title;
  const lead = service && LEAD_KEY[service.slug] ? t(LEAD_KEY[service.slug]) : service?.lead;
  const categoryLabel =
    service && dict.categories[service.category as keyof typeof dict.categories]
      ? dict.categories[service.category as keyof typeof dict.categories]
      : service?.category;

  if (!service) {
    return (
      <PublicShell active="services" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} services={serviceList}>
        <div className="container" style={{ padding: '10rem 1.5rem 5rem', textAlign: 'center' }}>
          <h1 className="section-title">{t('services.notFound')}</h1>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
            {t('services.notFoundBody')}
          </p>
          <button type="button" className="btn btn-primary" style={{ color: '#000' }} onClick={() => navigate('/services')}>
            {t('common.backToServices')}
          </button>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell active="services" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} services={serviceList}>
      <div className="service-detail">
        <header className="page-hero sd-hero">
          <div
            className="page-hero-bg"
            style={{
              background: `linear-gradient(120deg, rgba(9,9,11,0.9) 0%, rgba(9,9,11,0.55) 55%, rgba(9,9,11,0.4) 100%), url('${getImageUrl(service.heroImage)}') center/cover no-repeat`,
            }}
          />
          <div className="container page-hero-inner">
            <button type="button" className="sd-back" onClick={() => navigate('/services')}>
              {t('common.backToServices')}
            </button>
            <span className="page-kicker">Service {service.index}</span>
            <h1>{title}</h1>
            <p>{lead}</p>
          </div>
        </header>

        <section className="sd-overview">
          <div className="container sd-overview-grid">
            <div className="reveal-up">
              <h2 className="section-title">{t('services.overview')}</h2>
              <p className="sd-body">{service.overview}</p>
              <ul className="svc-points sd-points">
                {service.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div className="sd-side reveal-up" style={{ transitionDelay: '0.1s' }}>
              <h3>{t('services.approach')}</h3>
              <ol className="sd-approach">
                {service.approach.map((item, i) => (
                  <li key={item}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="sd-outcomes">
          <div className="container">
            <h2 className="section-title reveal-up">{t('services.outcomes')}</h2>
            <div className="sd-outcomes-grid">
              {service.outcomes.map((item, i) => (
                <div key={item} className="sd-outcome reveal-up" style={{ transitionDelay: `${i * 0.08}s` }}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sd-projects">
          <div className="container">
            <div className="reveal-up" style={{ marginBottom: '2.5rem' }}>
              <h2 className="section-title">{t('services.projectsIn')} {categoryLabel}</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {t('services.projectsInSub')}
              </p>
            </div>

            <div className="projects-grid">
              {isLoading ? (
                <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1' }}>{t('common.loadingProjects')}</p>
              ) : projects.length === 0 ? (
                <div className="sd-empty reveal-up">
                  <p>{t('services.noProjectsCat')}</p>
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/portfolio')}>
                    {t('services.browseAll')}
                  </button>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="project-card"
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project);
                    }}
                  >
                    <div className="project-img-wrap">
                      <img src={getImageUrl(project.image)} alt={project.title} className="project-img" />
                      <div className="project-overlay">
                        <span className="project-view-btn">{t('common.viewDetails')}</span>
                      </div>
                    </div>
                    <div className="project-info">
                      <span className="project-category">{project.category}</span>
                      <h3 className="project-title">{project.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{project.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="about-cta" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="about-cta-band reveal-up">
              <div>
                <h2>{t('services.discuss')} {title} {t('services.discussSuffix')}</h2>
                <p>{t('services.discussBody')}</p>
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
      </div>

      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isDarkTheme={isDarkTheme}
        />
      )}
    </PublicShell>
  );
}
