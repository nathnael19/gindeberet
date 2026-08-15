import { useState, useEffect } from 'react';
import './App.css';
import { type Project } from './ProjectDetail';
import AdminLogin from './AdminLogin';
import ForgotPassword from './ForgotPassword';
import NewPassword from './NewPassword';
import AdminDashboard from './AdminDashboard';
import AdminProjects from './AdminProjects';
import AdminAddProject from './AdminAddProject';
import AdminSettings from './AdminSettings';
import AboutPage from './AboutPage';
import ServicesPage from './ServicesPage';
import ServiceDetailPage from './ServiceDetailPage';
import PortfolioPage from './PortfolioPage';
import ContactPage from './ContactPage';
import CareersPage from './CareersPage';
import AdminCareers from './AdminCareers';
import AdminStampSign from './AdminStampSign';
import { publicApi, settingsApi, landingApi, careersApi, getToken } from './api';
import { OFFICE, officePlaceUrl } from './contactLocation';
import { getImageUrl } from './imageUrl';
import { useI18n } from './i18n/I18nContext';
import HomePage from './HomePage';
import { resolveServices } from './servicesData';
import { applySeo } from './seo';

const DEFAULT_SITE_SETTINGS = {
  officeLocation: OFFICE.address,
  phone: '+251 911 908 456\n+251 917 000 912',
  workingHours: 'Mon–Fri, 8:00am–6:00pm',
  email: 'gindeberetconstruction2772@gmail.com',
  mapUrl: officePlaceUrl(),
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = getToken();
  return !!token; // Returns true if token exists
};

function App() {
  const { t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);
  const [awardsCount, setAwardsCount] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);

  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [services, setServices] = useState(resolveServices([]));
  const [partners, setPartners] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    applySeo(currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const path = window.location.pathname;
      const authenticated = isAuthenticated();

      // /admin itself shows login when logged out — do not redirect away
      const protectedRoutes = ['/projects', '/projects/add', '/vacancies', '/stamp-sign', '/settings'];
      const isProtectedRoute = protectedRoutes.some(route => path === route || path.startsWith(route + '/'));

      if (isProtectedRoute && !authenticated) {
        window.location.href = '/admin';
      }

      if ((path === '/auth' || path === '/auth/') && authenticated) {
        window.location.href = '/admin';
      }
    };

    checkAuthAndRedirect();
  }, [currentRoute]);

  // Theme Toggler logic
  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkTheme(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDarkTheme(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // Fetch published projects for portfolio display + full admin totals for counters
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const [response, summaryRes] = await Promise.all([
          publicApi.getProjects(),
          publicApi.getSummary().catch(() => null),
        ]);

        if (summaryRes?.success && summaryRes.data) {
          setCompletedProjectsCount(summaryRes.data.completedProjects || 0);
          setAwardsCount(summaryRes.data.awards || 0);
        }

        if (response.success) {
          if (!summaryRes?.success) {
            setCompletedProjectsCount(
              response.data.filter((p: any) => p.status?.toLowerCase() === 'completed').length
            );
          }
          // Transform backend data to match frontend Project type
          const transformedProjects = response.data.map((p: any) => ({
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
            status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
            challenge: p.challenge || undefined,
            solution: p.solution || undefined,
            highlights: Array.isArray(p.highlights) && p.highlights.length > 0 ? p.highlights : undefined,
            gallery: p.gallery && p.gallery.length > 0 ? p.gallery.map((url: string) => getImageUrl(url)) : (p.image ? [getImageUrl(p.image)] : ['https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'])
          }));
          setProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjectsError(t('common.failedProjects'));
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch site settings (office location, phone, working hours)
  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await settingsApi.getSite();
        if (response.success && response.data) {
          setSiteSettings({
            officeLocation: response.data.officeLocation || DEFAULT_SITE_SETTINGS.officeLocation,
            phone: response.data.phone || DEFAULT_SITE_SETTINGS.phone,
            workingHours: response.data.workingHours || DEFAULT_SITE_SETTINGS.workingHours,
            email: response.data.email || DEFAULT_SITE_SETTINGS.email,
            mapUrl: response.data.mapUrl || DEFAULT_SITE_SETTINGS.mapUrl
          });
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();
  }, []);

  useEffect(() => {
    const fetchLandingData = async () => {
      const sections = [
        ['hero', (data: any[]) => setHeroSlides(data || [])],
        ['services', (data: any[]) => setServices(resolveServices(data || []))],
        ['partners', (data: any[]) => setPartners(data || [])],
        ['testimonials', (data: any[]) => setTestimonials(data || [])],
        ['awards', (data: any[]) => {
          setAwards(data || []);
          if (data?.length) setAwardsCount(data.length);
        }],
        ['news', (data: any[]) => setNewsItems(data || [])],
      ] as const;

      const results = await Promise.allSettled(
        sections.map(([section]) => landingApi.getSection(section))
      );

      results.forEach((result, i) => {
        const [, apply] = sections[i];
        if (result.status === 'fulfilled' && result.value?.success) {
          apply(result.value.data || []);
        } else if (result.status === 'rejected') {
          console.error(`Error fetching landing/${sections[i][0]}:`, result.reason);
        }
      });

      try {
        const vacRes = await careersApi.getOpenVacancies();
        if (vacRes.success && Array.isArray(vacRes.data)) {
          const vacancyCards = vacRes.data.slice(0, 6).map((v: any) => ({
            id: `vacancy-${v.id}`,
            title: v.title,
            excerpt: v.department
              ? `${v.department}${v.location ? ` · ${v.location}` : ''}`
              : v.location || v.employmentType || 'Open position',
            date: v.deadline
              ? `Deadline ${String(v.deadline).slice(0, 10)}`
              : 'Open vacancy',
            category: 'vacancy',
            linkUrl: '/careers',
            sortOrder: -1,
            createdAt: v.createdAt,
          }));
          setNewsItems((prev) => {
            const withoutVac = prev.filter((n) => n.category !== 'vacancy' && !String(n.id).startsWith('vacancy-'));
            return [...vacancyCards, ...withoutVac];
          });
        }
      } catch (err) {
        console.error('Error fetching vacancies for home:', err);
      }
    };
    fetchLandingData();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  // Intersection Observer for scroll animations — must rebind when returning to Home
  // (App stays mounted across routes, so a one-time observe leaves new .reveal-up stuck hidden)
  const isHomeRoute = currentRoute === '/' || currentRoute === '';
  useEffect(() => {
    if (!isHomeRoute) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    let cancelled = false;
    const bind = () => {
      if (cancelled) return;
      document.querySelectorAll('.reveal-up').forEach((el) => {
        // Already on-screen (e.g. top sections after client nav): show immediately
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
        if (inView) el.classList.add('active');
        observer.observe(el);
      });
    };

    // Wait a frame so Home DOM (and late-loaded cards) exist after route change
    const raf = requestAnimationFrame(() => {
      bind();
      // Second pass after images/lists settle
      window.setTimeout(bind, 120);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [
    isHomeRoute,
    projects.length,
    heroSlides.length,
    services.length,
    partners.length,
    testimonials.length,
    awards.length,
    newsItems.length,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredProjects = projects.slice(0, 8);
  const phoneLines = (siteSettings.phone || DEFAULT_SITE_SETTINGS.phone)
    .split(/\n|\//)
    .map((p) => p.trim())
    .filter(Boolean);
  const displayPhone = phoneLines.join(' / ');
  const displayEmail = (siteSettings.email || DEFAULT_SITE_SETTINGS.email).split('\n')[0];
  const phoneHref = `tel:${phoneLines[0].replace(/\s+/g, '')}`;

  if (currentRoute === '/auth' || currentRoute === '/auth/') {
    // Keep /auth as alias — send people to /admin login entry
    window.location.replace('/admin');
    return null;
  }

  if (currentRoute === '/forgot-password' || currentRoute === '/forgot-password/') {
    return <ForgotPassword isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/new-password' || currentRoute === '/new-password/') {
    return <NewPassword isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/admin' || currentRoute === '/admin/') {
    if (!isAuthenticated()) {
      return <AdminLogin isDarkTheme={isDarkTheme} />;
    }
    return <AdminDashboard isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/projects' || currentRoute === '/projects/') {
    if (!isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminProjects isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/projects/add' || currentRoute === '/projects/add/') {
    if (!isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminAddProject isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/settings' || currentRoute === '/settings/') {
    if (!isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminSettings isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/vacancies' || currentRoute === '/vacancies/') {
    if (!isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminCareers isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/stamp-sign' || currentRoute === '/stamp-sign/') {
    if (!isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminStampSign isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/about' || currentRoute === '/about/') {
    return (
      <AboutPage
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        completedProjectsCount={completedProjectsCount}
      />
    );
  }

  if (currentRoute === '/services' || currentRoute === '/services/') {
    return (
      <ServicesPage
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        services={services}
      />
    );
  }

  if (currentRoute.startsWith('/services/')) {
    const slug = currentRoute.replace(/\/+$/, '').split('/')[2] || '';
    return (
      <ServiceDetailPage
        slug={slug}
        isDarkTheme={isDarkTheme}
        toggleTheme={toggleTheme}
        services={services}
      />
    );
  }

  if (currentRoute === '/portfolio' || currentRoute === '/portfolio/') {
    return <PortfolioPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/contact' || currentRoute === '/contact/') {
    return <ContactPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/careers' || currentRoute === '/careers/') {
    return <CareersPage isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }


  return (
    <HomePage
      isDarkTheme={isDarkTheme}
      toggleTheme={toggleTheme}
      isScrolled={isScrolled}
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
      projects={projects}
      featuredProjects={featuredProjects}
      completedProjectsCount={completedProjectsCount}
      isLoadingProjects={isLoadingProjects}
      projectsError={projectsError}
      selectedProject={selectedProject}
      setSelectedProject={setSelectedProject}
      heroSlides={heroSlides}
      services={services}
      partners={partners}
      testimonials={testimonials}
      awards={awards}
      awardsCount={awardsCount || awards.length}
      newsItems={newsItems}
      displayPhone={displayPhone}
      displayEmail={displayEmail}
      phoneHref={phoneHref}
    />
  );
}

export default App;
