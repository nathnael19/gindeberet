import { useEffect, useState } from 'react';
import PublicShell from './PublicShell';
import ProjectDetail, { type Project } from './ProjectDetail';
import { publicApi } from './api';
import { getImageUrl } from './imageUrl';
import { useI18n } from './i18n/I18nContext';
import './AboutPage.css';
import './PortfolioPage.css';
import './App.css';

const CATEGORIES = ['All', 'Roads', 'Buildings', 'Water', 'Electro-Mechanical', 'Machinery', 'Corridors', 'Bridges', 'Infrastructure', 'Commercial'] as const;

interface PortfolioPageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

export default function PortfolioPage({ isDarkTheme, toggleTheme }: PortfolioPageProps) {
  const { t, dict } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await publicApi.getProjects();
        if (response.success) {
          setProjects(
            response.data.map((p: any) => ({
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
            }))
          );
        }
      } catch {
        setError('failed');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered =
    activeFilter === 'All' ? projects : projects.filter((p) => p.category === activeFilter);

  return (
    <PublicShell active="portfolio" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}>
      <div className="portfolio-page">
        <header className="page-hero">
          <div className="page-hero-bg" />
          <div className="container page-hero-inner">
            <span className="page-kicker">{t('portfolio.kicker')}</span>
            <h1>{t('portfolio.heroTitle')}</h1>
            <p>{t('portfolio.heroSubtitle')}</p>
          </div>
        </header>

        <section className="portfolio-body">
          <div className="container">
            <div className="filter-container reveal-up">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                  onClick={() => setActiveFilter(category)}
                >
                  {dict.categories[category]}
                </button>
              ))}
            </div>

            <div className="projects-grid">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-muted)' }}>{t('common.loadingProjects')}</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                  <p style={{ color: '#EF4444' }}>{t('common.failedProjects')}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-muted)' }}>{t('common.noProjects')}</p>
                </div>
              ) : (
                filtered.map((project) => (
                  <div
                    key={project.id}
                    className="project-card"
                    onClick={() => setSelectedProject(project)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${project.title}`}
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
