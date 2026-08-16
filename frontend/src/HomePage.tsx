import { useEffect, useRef, useState } from 'react';
import { useI18n, type I18nKey } from './i18n/I18nContext';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import { navigate } from './navigate';
import { getImageUrl } from './imageUrl';
import { type ServiceDef, SERVICES } from './servicesData';
import type { Project } from './ProjectDetail';
import ProjectDetail from './ProjectDetail';
import './App.css';

const SERVICE_TITLE_KEY: Record<string, I18nKey> = {
  'road-construction': 'services.roads',
  'building-construction': 'services.building',
  'water-works': 'services.water',
  'electro-mechanical': 'services.electro',
  'machinery-rental': 'services.machinery',
  corridors: 'services.corridors',
};

const SERVICE_LEAD_KEY: Record<string, I18nKey> = {
  'road-construction': 'services.roadsLead',
  'building-construction': 'services.buildingLead',
  'water-works': 'services.waterLead',
  'electro-mechanical': 'services.electroLead',
  'machinery-rental': 'services.machineryLead',
  corridors: 'services.corridorsLead',
};

interface HomePageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  isScrolled: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  projects: Project[];
  featuredProjects: Project[];
  completedProjectsCount: number;
  isLoadingProjects: boolean;
  projectsError: string;
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  heroSlides?: any[];
  services?: ServiceDef[];
  partners: any[];
  testimonials: any[];
  awards: any[];
  awardsCount?: number;
  newsItems: any[];
  displayPhone: string;
  displayEmail: string;
  phoneHref: string;
}

function resolveHeroImage(path: string) {
  return getImageUrl(path);
}

export default function HomePage({
  isDarkTheme,
  toggleTheme,
  isScrolled,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  featuredProjects,
  completedProjectsCount,
  isLoadingProjects,
  projectsError,
  selectedProject,
  setSelectedProject,
  heroSlides: heroSlidesFromApi = [],
  services: servicesProp,
  partners,
  testimonials,
  awards,
  awardsCount,
  newsItems,
  displayPhone,
  displayEmail,
  phoneHref,
}: HomePageProps) {
  const displayServices = servicesProp && servicesProp.length > 0 ? servicesProp : SERVICES;
  const { t, lang } = useI18n();
  const fallbackHeroSlides = [
    {
      id: 'local-1',
      title1: t('hero.title1'),
      title2: t('hero.title2'),
      line: t('hero.rotate1'),
      image: '/images/hero.jpg',
    },
    {
      id: 'local-2',
      title1: t('hero.slide2a'),
      title2: t('hero.slide2b'),
      line: t('hero.rotate2'),
      image: '/images/about.jpg',
    },
    {
      id: 'local-3',
      title1: t('hero.slide3a'),
      title2: t('hero.slide3b'),
      line: t('hero.rotate3'),
      image: '/images/portfolio-2.jpg',
    },
  ];
  const heroSlides =
    heroSlidesFromApi.length > 0
      ? heroSlidesFromApi.map((s) => ({
          id: s.id,
          title1: s.title1 || '',
          title2: s.title2 || '',
          line: s.line || '',
          image: resolveHeroImage(s.imageUrl || s.image || '/images/hero.jpg'),
        }))
      : fallbackHeroSlides;
  const [slideIndex, setSlideIndex] = useState(0);
  const [heroPhase, setHeroPhase] = useState(-1);
  const [textLeaving, setTextLeaving] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const leaveTimerRef = useRef<number | null>(null);
  const slide = heroSlides[slideIndex] || heroSlides[0];
  const slideCount = Math.max(heroSlides.length, 1);

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current != null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const advanceSlide = (next: number) => {
    if (textLeaving) return;
    setTextLeaving(true);
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => {
      setSlideIndex(next);
      setTextLeaving(false);
      leaveTimerRef.current = null;
    }, 380);
  };

  useEffect(() => {
    setSlideIndex(0);
    setHeroPhase(-1);
    setTextLeaving(false);
    clearLeaveTimer();
    const phaseDelays = [80, 380, 720, 1100, 1450];
    const phaseTimers = phaseDelays.map((delay, i) =>
      window.setTimeout(() => setHeroPhase(i), delay)
    );
    const slideTimer = window.setInterval(() => {
      setTextLeaving(true);
      clearLeaveTimer();
      leaveTimerRef.current = window.setTimeout(() => {
        setSlideIndex((i) => (i + 1) % slideCount);
        setTextLeaving(false);
        leaveTimerRef.current = null;
      }, 380);
    }, 8000);
    return () => {
      phaseTimers.forEach((id) => window.clearTimeout(id));
      window.clearInterval(slideTimer);
      clearLeaveTimer();
    };
  }, [lang, slideCount, heroSlidesFromApi.length]);

  useEffect(() => {
    if (slideIndex >= slideCount) setSlideIndex(0);
  }, [slideCount, slideIndex]);

  const goToSlide = (next: number) => {
    if (next === slideIndex) return;
    advanceSlide(next);
  };

  const testimonialCount = testimonials.length;

  useEffect(() => {
    setTestimonialIndex(0);
  }, [testimonialCount]);

  useEffect(() => {
    if (testimonialCount <= 1) return;
    const timer = window.setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonialCount);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [testimonialCount]);

  const goToTestimonial = (next: number) => {
    if (testimonialCount === 0) return;
    setTestimonialIndex(((next % testimonialCount) + testimonialCount) % testimonialCount);
  };

  const fallbackAwards = [
    { id: 'fa1', title: t('homeAwards.a1Title'), description: t('homeAwards.a1Text'), icon: '01', imageUrl: '' },
    { id: 'fa2', title: t('homeAwards.a2Title'), description: t('homeAwards.a2Text'), icon: '02', imageUrl: '' },
    { id: 'fa3', title: t('homeAwards.a3Title'), description: t('homeAwards.a3Text'), icon: '03', imageUrl: '' },
    { id: 'fa4', title: t('homeAwards.a4Title'), description: t('homeAwards.a4Text'), icon: '04', imageUrl: '' },
  ];
  const displayAwards =
    awards.length > 0
      ? awards.map((a, i) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon || String(i + 1).padStart(2, '0'),
          imageUrl: a.imageUrl || '',
        }))
      : fallbackAwards;

  return (
    <div className="app has-utility">
      <div className="utility-bar">
        <div className="container utility-bar-inner">
          <a href={phoneHref} className="utility-link">
            <span className="utility-label">{t('utility.call')}</span>
            <strong>{displayPhone}</strong>
          </a>
          <a href={`mailto:${displayEmail}`} className="utility-link utility-link-email">
            <span className="utility-label">{t('utility.email')}</span>
            <strong>{displayEmail}</strong>
          </a>
        </div>
      </div>

      <nav className={`navbar ${isScrolled ? 'glass' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="/"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <img src="/logo.png" alt="Gindeberet General Construction PLC" style={{ height: '40px', width: 'auto', display: 'block' }} />
            <span>Gindeberet General Construction PLC</span>
          </a>

          <div className="nav-links">
            <a href="/" className="nav-active" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('nav.home')}</a>
            <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>{t('nav.about')}</a>
            <a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }}>{t('nav.services')}</a>
            <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>{t('nav.projects')}</a>
            <a href="/careers" onClick={(e) => { e.preventDefault(); navigate('/careers'); }}>{t('nav.vacancies')}</a>
            <a
              href="/contact"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
            >
              {t('nav.contact')}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSwitcher light={!isScrolled} />
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme" style={{ fontSize: '1.25rem' }}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="/" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/'); }}>{t('nav.home')}</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/about'); }}>{t('nav.about')}</a>
          <a href="/services" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/services'); }}>{t('nav.services')}</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/portfolio'); }}>{t('nav.projects')}</a>
          <a href="/careers" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/careers'); }}>{t('nav.vacancies')}</a>
          <a href="/contact" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); navigate('/contact'); }}>{t('nav.contactShort')}</a>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          {heroSlides.map((s, i) => (
            <div
              key={s.id ?? `${s.image}-${i}`}
              className={`hero-bg-slide ${i === slideIndex ? 'is-active' : ''} ${
                i % 2 === 0 ? 'pan-rtl' : 'pan-ltr'
              }`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="container">
          <div className="hero-content" key={`${lang}-base`}>
            <p className={`hero-brand hero-seq ${heroPhase >= 0 ? 'is-in' : ''}`}>
              {t('hero.brand')}
            </p>
            <h1
              className={`hero-title ${textLeaving ? 'is-leaving' : ''}`}
              aria-live="polite"
            >
              <span key={`${lang}-${slideIndex}-t1`} className="hero-title-swap hero-title-one">
                {slide.title1}
              </span>
              <span key={`${lang}-${slideIndex}-t2`} className="hero-title-swap hero-title-two">
                {slide.title2}
              </span>
            </h1>
            <p className={`hero-rotate hero-seq ${heroPhase >= 3 ? 'is-in' : ''} ${textLeaving ? 'is-leaving' : ''}`}>
              <span key={`${lang}-${slideIndex}-line`} className="hero-rotate-item">
                {slide.line}
              </span>
            </p>
            <div className="hero-buttons">
              <a
                href="/services"
                className={`btn btn-primary hero-seq hero-seq-btn ${heroPhase >= 4 ? 'is-in' : ''}`}
                style={{ transitionDelay: '0s' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/services');
                }}
              >
                {t('common.allServices')}
              </a>
              <a
                href="/contact"
                className={`btn btn-hero-outline hero-seq hero-seq-btn ${heroPhase >= 4 ? 'is-in' : ''}`}
                style={{ transitionDelay: '0.12s' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/contact');
                }}
              >
                {t('common.contactUs')}
              </a>
            </div>
            <div className="hero-slide-dots" role="tablist" aria-label="Hero slides">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === slideIndex}
                  aria-label={`Slide ${i + 1}`}
                  className={`hero-dot ${i === slideIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pillars-section">
        <div className="container">
          <div className="pillars-grid">
            {[
              { title: t('homePillars.p1Title'), text: t('homePillars.p1Text') },
              { title: t('homePillars.p2Title'), text: t('homePillars.p2Text') },
              { title: t('homePillars.p3Title'), text: t('homePillars.p3Text') },
            ].map((item, i) => (
              <div key={item.title} className="pillar-item reveal-up" style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className="pillar-index">0{i + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="why-section" id="about">
        <div className="container why-grid">
          <div className="why-media reveal-up why-media--in">
            <img
              src="/images/solutions-handshake.png"
              alt="Gindeberet partnership and project agreement"
              className="why-media-img"
            />
          </div>
          <div className="why-content reveal-up why-content--in" style={{ transitionDelay: '0.1s' }}>
            <span className="section-kicker">{t('homeWhy.kicker')}</span>
            <h2 className="section-title">{t('homeWhy.title')}</h2>
            <p className="why-body">{t('homeWhy.body')}</p>
            <ul className="why-list">
              <li>{t('homeWhy.b1')}</li>
              <li>{t('homeWhy.b2')}</li>
              <li>{t('homeWhy.b3')}</li>
            </ul>
            <a
              href="/about"
              className="btn btn-outline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
            >
              {t('homeWhy.cta')}
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="home-services-section">
        <div className="container">
          <div className="section-head reveal-up">
            <div>
              <span className="section-kicker">{t('homeServices.kicker')}</span>
              <h2 className="section-title">{t('homeServices.title')}</h2>
              <p className="section-subtitle" style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                {t('homeServices.subtitle')}
              </p>
            </div>
            <a href="/services" className="btn btn-outline" onClick={(e) => { e.preventDefault(); navigate('/services'); }}>
              {t('common.allServices')}
            </a>
          </div>
          <div className="svc-tiles">
            {displayServices.map((svc, i) => (
              <button
                key={svc.slug}
                type="button"
                className="svc-tile reveal-up"
                style={{ transitionDelay: `${i * 0.06}s` }}
                onClick={() => navigate(`/services/${svc.slug}`)}
              >
                <div className="svc-tile-media">
                  <img src={getImageUrl(svc.heroImage)} alt="" className="img-kenburns" />
                </div>
                <div className="svc-tile-body">
                  <span className="svc-tile-index">{svc.index}</span>
                  <h3>{SERVICE_TITLE_KEY[svc.slug] ? t(SERVICE_TITLE_KEY[svc.slug]) : svc.title}</h3>
                  <p>{SERVICE_LEAD_KEY[svc.slug] ? t(SERVICE_LEAD_KEY[svc.slug]) : svc.lead}</p>
                  <span className="svc-tile-link">{t('homeServices.details')} →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="awards-showcase">
        <div
          className="awards-showcase-bg"
          style={{ backgroundImage: "url('/images/about.jpg')" }}
          aria-hidden="true"
        />
        <div className="awards-showcase-veil" aria-hidden="true" />
        <div className="container awards-showcase-head reveal-up">
          <span className="section-kicker awards-showcase-kicker">{t('awards.kicker')}</span>
          <h2 className="awards-showcase-title">{t('awards.title')}</h2>
          <p className="awards-showcase-sub">{t('awards.subtitle')}</p>
        </div>
        <div className="awards-marquee" aria-label={t('awards.kicker')}>
          <div className="awards-marquee-track">
            {[...displayAwards, ...displayAwards].map((award, i) => (
              <article
                key={`${award.id}-${i}`}
                className="award-scroll-card"
                aria-hidden={i >= displayAwards.length}
              >
                <div className="award-scroll-media">
                  {award.imageUrl ? (
                    <img src={getImageUrl(award.imageUrl)} alt="" loading="lazy" />
                  ) : (
                    <span className="award-scroll-fallback">{String(award.icon).slice(0, 3)}</span>
                  )}
                </div>
                <div className="award-scroll-body">
                  <span className="award-scroll-index">{String(award.icon).slice(0, 3)}</span>
                  <h3>{award.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
        <p className="awards-scroll-hint">{t('awards.scrollHint')}</p>
      </section>

      <section id="projects" className="portfolio-section home-projects">
        <div className="container">
          <div className="section-head reveal-up">
            <div>
              <span className="section-kicker">{t('homeProjects.kicker')}</span>
              <h2 className="section-title">{t('homeProjects.title')}</h2>
              <p className="section-subtitle" style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                {t('homeProjects.subtitle')}
              </p>
            </div>
            <a href="/portfolio" className="btn btn-outline" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>
              {t('common.viewAllProjects')}
            </a>
          </div>

          <div className="projects-grid featured-grid">
            {isLoadingProjects ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>{t('common.loadingProjects')}</p>
              </div>
            ) : projectsError ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: '#EF4444' }}>{t('common.failedProjects')}</p>
              </div>
            ) : featuredProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>{t('common.noProjects')}</p>
              </div>
            ) : (
              featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card reveal-up"
                  onClick={() => setSelectedProject(project)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${project.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project);
                  }}
                >
                  <div className="project-img-wrap">
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.title}
                      className="project-img img-kenburns"
                    />
                    <div className="project-overlay">
                      <span className="project-view-btn">{t('common.viewDetails')}</span>
                    </div>
                  </div>
                  <div className="project-info">
                    <span className="project-category">{project.category}</span>
                    <h3 className="project-title">{project.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {project.location}
                      {project.year ? ` · ${project.year}` : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="experience-section">
        <div className="container">
          <div className="experience-intro reveal-up">
            <span className="section-kicker">{t('homeExperience.kicker')}</span>
            <h2 className="section-title">{t('homeExperience.title')}</h2>
            <p>{t('homeExperience.body')}</p>
          </div>
          <div className="experience-pillars">
            {[
              { title: t('homeExperience.p1Title'), text: t('homeExperience.p1Text') },
              { title: t('homeExperience.p2Title'), text: t('homeExperience.p2Text') },
              { title: t('homeExperience.p3Title'), text: t('homeExperience.p3Text') },
              { title: t('homeExperience.p4Title'), text: t('homeExperience.p4Text') },
            ].map((item, i) => (
              <div key={item.title} className="exp-pillar reveal-up" style={{ transitionDelay: `${i * 0.06}s` }}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="stats-band reveal-up">
            <div className="stat-band-item">
              <strong>14+</strong>
              <span>{t('homeExperience.yearsLabel')}</span>
            </div>
            <div className="stat-band-item">
              <strong>{completedProjectsCount}+</strong>
              <span>{t('homeExperience.projectsLabel')}</span>
            </div>
            <div className="stat-band-item">
              <strong>{(awardsCount ?? awards.length)}+</strong>
              <span>{t('homeExperience.awardsLabel')}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">{t('testimonials.title')}</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 2.5rem auto', color: 'var(--text-muted)' }}>
              {t('testimonials.subtitle')}
            </p>
          </div>

          {testimonials.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{t('testimonials.empty')}</p>
          ) : (
            <div className="testimonials-carousel reveal-up">
              <button
                type="button"
                className="testimonial-nav testimonial-nav--prev"
                aria-label="Previous testimonial"
                onClick={() => goToTestimonial(testimonialIndex - 1)}
                disabled={testimonialCount <= 1}
              >
                ‹
              </button>

              <div className="testimonials-viewport">
                <div
                  className="testimonials-track"
                  style={{ transform: `translateX(-${testimonialIndex * 100}%)` }}
                >
                  {testimonials.map((item) => (
                    <div key={item.id} className="testimonial-slide">
                      <article className="testimonial-card">
                        <div className="quote-icon">"</div>
                        <p className="testimonial-text">"{item.text}"</p>
                        <div className="testimonial-author">
                          <div className="author-info">
                            <h4>{item.authorName}</h4>
                            <span>{item.authorTitle}</span>
                          </div>
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="testimonial-nav testimonial-nav--next"
                aria-label="Next testimonial"
                onClick={() => goToTestimonial(testimonialIndex + 1)}
                disabled={testimonialCount <= 1}
              >
                ›
              </button>

              <div className="testimonial-dots" role="tablist" aria-label="Testimonials">
                {testimonials.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={i === testimonialIndex}
                    className={`testimonial-dot ${i === testimonialIndex ? 'is-active' : ''}`}
                    onClick={() => goToTestimonial(i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="partners-section">
        <div className="container">
          <p className="partners-title">{t('partners.title')}</p>
          <div className="partners-logos">
            {partners.length > 0 ? (
              partners.map((partner) => (
                <div key={partner.id} className="partner-logo">
                  {partner.logoUrl ? (
                    <img src={getImageUrl(partner.logoUrl)} alt={partner.name} style={{ maxHeight: '40px' }} />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ color: 'var(--text-muted)' }}>{t('partners.empty')}</div>
            )}
          </div>
        </div>
      </section>

      <section id="news" className="news-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">{t('news.title')}</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem auto', color: 'var(--text-muted)' }}>
              {t('news.subtitle')}
            </p>
          </div>
          <div className="news-grid">
            {newsItems.length > 0 ? (
              newsItems.map((news, i) => {
                const cat = String(news.category || 'news').toLowerCase();
                const catLabel =
                  cat === 'event'
                    ? t('news.catEvent')
                    : cat === 'announcement'
                      ? t('news.catAnnouncement')
                      : cat === 'vacancy'
                        ? t('news.catVacancy')
                        : t('news.catNews');
                const cardInner = (
                  <>
                    {news.imageUrl ? (
                      <div className="news-media">
                        <img src={getImageUrl(news.imageUrl)} alt="" loading="lazy" />
                      </div>
                    ) : null}
                    <div className="news-content">
                      <div className="news-meta">
                        <span className={`news-cat news-cat--${cat}`}>{catLabel}</span>
                        <span className="news-date">{news.date}</span>
                      </div>
                      <h3>{news.title}</h3>
                      <p>{news.excerpt}</p>
                      {news.linkUrl && <span className="news-link">{t('news.readMore')}</span>}
                    </div>
                  </>
                );
                return news.linkUrl ? (
                  <a
                    key={news.id}
                    href={news.linkUrl}
                    className="news-card reveal-up"
                    style={{ transitionDelay: `${i * 0.1}s` }}
                    onClick={(e) => {
                      if (news.linkUrl.startsWith('/')) {
                        e.preventDefault();
                        navigate(news.linkUrl);
                      }
                    }}
                  >
                    {cardInner}
                  </a>
                ) : (
                  <article
                    key={news.id}
                    className="news-card reveal-up"
                    style={{ transitionDelay: `${i * 0.1}s` }}
                  >
                    {cardInner}
                  </article>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>{t('news.empty')}</p>
            )}
          </div>
        </div>
      </section>

      <section className="contact-cta-band">
        <div className="container contact-cta-inner reveal-up">
          <div>
            <h2>{t('homeContact.title')}</h2>
            <p>{t('homeContact.subtitle')}</p>
          </div>
          <div className="contact-cta-actions">
            <a href={phoneHref} className="contact-cta-phone">
              {displayPhone}
            </a>
            <a
              href="/contact"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
            >
              {t('homeContact.fullContact')}
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div
            className="footer-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}
          >
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <img src="/logo.png" alt="Gindeberet General Construction PLC" style={{ height: '48px', width: 'auto', display: 'block' }} />
                <h4 style={{ color: 'white', fontSize: '1.05rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                  Gindeberet General Construction PLC
                </h4>
              </div>
              <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '1rem', lineHeight: 1.6 }}>{t('footer.blurb')}</p>
            </div>
            <div className="footer-col">
              <h4>{t('footer.quickLinks')}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('nav.home')}</a>
                <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>{t('footer.aboutUs')}</a>
                <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>{t('nav.projects')}</a>
                <a href="/careers" onClick={(e) => { e.preventDefault(); navigate('/careers'); }}>{t('nav.vacancies')}</a>
                <a href="/services" onClick={(e) => { e.preventDefault(); navigate('/services'); }}>{t('nav.services')}</a>
                <a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>{t('nav.contactShort')}</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>{t('footer.services')}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {displayServices.map((svc) => (
                  <a
                    key={svc.slug}
                    href={`/services/${svc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/services/${svc.slug}`);
                    }}
                  >
                    {SERVICE_TITLE_KEY[svc.slug] ? t(SERVICE_TITLE_KEY[svc.slug]) : svc.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div
            className="footer-bottom"
            style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontSize: '0.875rem' }}
          >
            <p>
              &copy; {new Date().getFullYear()} Gindeberet General Construction PLC. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>

      {selectedProject && (
        <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} isDarkTheme={isDarkTheme} />
      )}
    </div>
  );
}
