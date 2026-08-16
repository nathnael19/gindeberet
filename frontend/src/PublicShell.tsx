import { useEffect, useState, type ReactNode } from 'react';
import { navigate } from './navigate';
import { landingApi } from './api';
import { useI18n, type I18nKey } from './i18n/I18nContext';
import LanguageSwitcher from './i18n/LanguageSwitcher';
import { resolveServices, type ServiceDef } from './servicesData';
import './App.css';

type NavKey = 'home' | 'about' | 'services' | 'portfolio' | 'careers' | 'contact';

interface PublicShellProps {
  active: NavKey;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  children: ReactNode;
  /** When true, navbar starts solid (inner pages). */
  solidNav?: boolean;
  services?: ServiceDef[];
}

const SERVICE_TITLE_KEY: Record<string, I18nKey> = {
  'road-construction': 'services.roads',
  'building-construction': 'services.building',
  'water-works': 'services.water',
  'electro-mechanical': 'services.electro',
  'machinery-rental': 'services.machinery',
  corridors: 'services.corridors',
};

export default function PublicShell({
  active,
  isDarkTheme,
  toggleTheme,
  children,
  solidNav = true,
  services: servicesProp,
}: PublicShellProps) {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<ServiceDef[]>(
    servicesProp && servicesProp.length > 0 ? servicesProp : resolveServices([])
  );

  useEffect(() => {
    if (servicesProp && servicesProp.length > 0) {
      setServices(servicesProp);
      return;
    }
    landingApi
      .getSection('services')
      .then((res) => {
        if (res.success) setServices(resolveServices(res.data || []));
      })
      .catch(() => {
        setServices(resolveServices([]));
      });
  }, [servicesProp]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    let cancelled = false;
    const bind = () => {
      if (cancelled) return;
      document.querySelectorAll('.reveal-up').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (inView) el.classList.add('active');
        observer.observe(el);
      });
    };

    const raf = requestAnimationFrame(() => {
      bind();
      window.setTimeout(bind, 120);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [children]);

  const go = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const navClass = (key: NavKey) => (active === key ? 'nav-active' : undefined);

  const showGlass = solidNav || isScrolled;

  return (
    <div className="app">
      <nav className={`navbar ${showGlass ? 'glass' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a
            href="/"
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              go('/');
            }}
          >
            <img src="/logo.png" alt="Gindeberet General Construction PLC" />
            <span className="logo-text">Gindeberet General Construction PLC</span>
          </a>

          <div className="nav-links">
            <a href="/" className={navClass('home')} onClick={(e) => { e.preventDefault(); go('/'); }}>
              {t('nav.home')}
            </a>
            <a href="/about" className={navClass('about')} onClick={(e) => { e.preventDefault(); go('/about'); }}>
              {t('nav.about')}
            </a>
            <a href="/services" className={navClass('services')} onClick={(e) => { e.preventDefault(); go('/services'); }}>
              {t('nav.services')}
            </a>
            <a href="/portfolio" className={navClass('portfolio')} onClick={(e) => { e.preventDefault(); go('/portfolio'); }}>
              {t('nav.projects')}
            </a>
            <a href="/careers" className={navClass('careers')} onClick={(e) => { e.preventDefault(); go('/careers'); }}>
              {t('nav.vacancies')}
            </a>
            <a
              href="/contact"
              className={`btn btn-primary ${active === 'contact' ? 'nav-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                go('/contact');
              }}
            >
              {t('nav.contact')}
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSwitcher light={!showGlass} />
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
          <a href="/" onClick={(e) => { e.preventDefault(); go('/'); }}>{t('nav.home')}</a>
          <a href="/about" onClick={(e) => { e.preventDefault(); go('/about'); }}>{t('nav.about')}</a>
          <a href="/services" onClick={(e) => { e.preventDefault(); go('/services'); }}>{t('nav.services')}</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); go('/portfolio'); }}>{t('nav.projects')}</a>
          <a href="/careers" onClick={(e) => { e.preventDefault(); go('/careers'); }}>{t('nav.vacancies')}</a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              go('/contact');
            }}
          >
            {t('nav.contactShort')}
          </a>
          <div style={{ padding: '0.75rem 1.25rem' }}>
            <LanguageSwitcher />
          </div>
        </div>
      )}

      {children}

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
              <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '1rem', lineHeight: 1.6 }}>
                {t('footer.blurb')}
              </p>
            </div>
            <div className="footer-col">
              <h4>{t('footer.quickLinks')}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="/" onClick={(e) => { e.preventDefault(); go('/'); }}>{t('nav.home')}</a>
                <a href="/about" onClick={(e) => { e.preventDefault(); go('/about'); }}>{t('footer.aboutUs')}</a>
                <a href="/portfolio" onClick={(e) => { e.preventDefault(); go('/portfolio'); }}>{t('nav.projects')}</a>
                <a href="/company-profile" onClick={(e) => { e.preventDefault(); go('/company-profile'); }}>Company Profile</a>
                <a href="/careers" onClick={(e) => { e.preventDefault(); go('/careers'); }}>{t('nav.vacancies')}</a>
                <a href="/services" onClick={(e) => { e.preventDefault(); go('/services'); }}>{t('nav.services')}</a>
                <a href="/contact" onClick={(e) => { e.preventDefault(); go('/contact'); }}>{t('nav.contactShort')}</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>{t('footer.services')}</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {services.map((svc) => (
                  <a
                    key={svc.slug}
                    href={`/services/${svc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/services/${svc.slug}`);
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
            <p>&copy; {new Date().getFullYear()} Gindeberet General Construction PLC. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
