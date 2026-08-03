import { useState, useEffect, useRef } from 'react';
import './App.css';
import ProjectDetail, { type Project } from './ProjectDetail';
import AdminLogin from './AdminLogin';
import ForgotPassword from './ForgotPassword';
import NewPassword from './NewPassword';
import AdminDashboard from './AdminDashboard';
import AdminProjects from './AdminProjects';
import AdminAddProject from './AdminAddProject';
import AdminSettings from './AdminSettings';
import { publicApi, settingsApi, landingApi, getToken } from './api';

const CATEGORIES = ['All', 'Roads', 'Corridors', 'Infrastructure', 'Bridges'];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

const DEFAULT_SITE_SETTINGS = {
  officeLocation: '123 Industrial Way, Builder City, BC 12345',
  phone: '(555) 123-4567',
  workingHours: 'Mon-Fri, 8am-6pm',
  email: 'info@gindeberet.com',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=9.0244,38.7469'
};

const getLineBreakText = (value: string | null | undefined) => {
  const text = (value || '').trim();
  return text ? text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  )) : null;
};

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  if (imagePath.startsWith('http')) {
    try {
      const parsedUrl = new URL(imagePath);
      if (parsedUrl.pathname.startsWith('/uploads/')) {
        return `${BACKEND_BASE_URL}${parsedUrl.pathname}`;
      }
    } catch {
      return imagePath;
    }

    return imagePath;
  }
  return `${BACKEND_BASE_URL}${imagePath}`;
};

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const token = getToken();
  return !!token; // Returns true if token exists
};

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [siteSettings, setSiteSettings] = useState<any>(DEFAULT_SITE_SETTINGS);
  
  // Landing Page Dynamic State
  const [partners, setPartners] = useState<any[]>([]);
  const [safetyFeatures, setSafetyFeatures] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  
  // Form State
  const [projectType, setProjectType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Re-check authentication on route changes (including back button)
  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const path = window.location.pathname;
      const authenticated = isAuthenticated();
      
      // Protected admin routes
      const protectedRoutes = ['/admin', '/projects', '/projects/add', '/settings'];
      const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
      
      if (isProtectedRoute && !authenticated) {
        window.location.href = '/auth';
      }
      
      // Auth route - redirect if already authenticated
      if ((path === '/auth' || path === '/auth/') && authenticated) {
        window.location.href = '/admin';
      }
    };

    checkAuthAndRedirect();
  }, [currentRoute]);

  const PROJECT_OPTIONS = [
    { value: 'roads', label: 'Roads & Highways' },
    { value: 'corridors', label: 'Transit Corridors' },
    { value: 'infrastructure', label: 'Civil Infrastructure' },
    { value: 'other', label: 'General Inquiry' }
  ];

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

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await publicApi.getProjects();
        if (response.success) {
          setCompletedProjectsCount(
            response.data.filter((p: any) => p.status?.toLowerCase() === 'completed').length
          );
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
        setProjectsError('Failed to load projects');
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

  // Fetch dynamic landing page sections
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [
          partnersRes,
          safetyRes,
          testimonialsRes,
          teamRes,
          awardsRes,
          newsRes
        ] = await Promise.all([
          landingApi.getSection('partners'),
          landingApi.getSection('safety'),
          landingApi.getSection('testimonials'),
          landingApi.getSection('team'),
          landingApi.getSection('awards'),
          landingApi.getSection('news')
        ]);
        
        if (partnersRes.success) setPartners(partnersRes.data);
        if (safetyRes.success) setSafetyFeatures(safetyRes.data);
        if (testimonialsRes.success) setTestimonials(testimonialsRes.data);
        if (teamRes.success) setTeamMembers(teamRes.data);
        if (awardsRes.success) setAwards(awardsRes.data);
        if (newsRes.success) setNewsItems(newsRes.data);
      } catch (error) {
        console.error('Error fetching landing data:', error);
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

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.reveal-up');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeFilter]); // Re-observe when filter changes

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter);

  if (currentRoute === '/auth' || currentRoute === '/auth/') {
    if (isAuthenticated()) {
      window.location.href = '/admin';
      return null;
    }
    return <AdminLogin isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/forgot-password' || currentRoute === '/forgot-password/') {
    return <ForgotPassword isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/new-password' || currentRoute === '/new-password/') {
    return <NewPassword isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/admin' || currentRoute === '/admin/') {
    if (!isAuthenticated()) {
      window.location.href = '/auth';
      return null;
    }
    return <AdminDashboard isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/projects' || currentRoute === '/projects/') {
    if (!isAuthenticated()) {
      window.location.href = '/auth';
      return null;
    }
    return <AdminProjects isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/projects/add' || currentRoute === '/projects/add/') {
    if (!isAuthenticated()) {
      window.location.href = '/auth';
      return null;
    }
    return <AdminAddProject isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  if (currentRoute === '/settings' || currentRoute === '/settings/') {
    if (!isAuthenticated()) {
      window.location.href = '/auth';
      return null;
    }
    return <AdminSettings isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'glass' : ''}`}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#" className="logo">
            <img src="/logo.png" alt="Gindeberet Logo" style={{ height: '40px', width: 'auto', display: 'block' }} />
            <span>GINDEBERET<span style={{color: 'var(--cta)'}}>.</span></span>
          </a>
          
          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#projects">Projects</a>
            <a href="#contact" className="btn btn-primary">Contact Us</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme" style={{ fontSize: '1.25rem' }}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#services" onClick={() => setIsMobileMenuOpen(false)}>Services</a>
          <a href="#projects" onClick={() => setIsMobileMenuOpen(false)}>Projects</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">Est. 2011</span>
            <h1>Building the <br/>Infrastructure <br/>of Tomorrow</h1>
            <p>We are a premier construction firm specializing in large-scale roads, corridors, and vital civil infrastructure projects.</p>
            <div className="hero-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#projects" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', color: '#000' }}>View Our Work</a>
              <a href="#contact" className="btn btn-hero-outline" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>Get in Touch</a>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="container">
          <p className="partners-title">Trusted by industry leaders and government agencies</p>
          <div className="partners-logos">
            {partners.length > 0 ? partners.map(partner => (
              <div key={partner.id} className="partner-logo">
                {partner.logoUrl ? <img src={getImageUrl(partner.logoUrl)} alt={partner.name} style={{maxHeight: '40px'}} /> : <span>{partner.name}</span>}
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)' }}>No partners added yet.</div>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content reveal-up">
              <h2 className="section-title">Built on Reliability</h2>
              <p className="section-subtitle" style={{ marginTop: '1.5rem', color: 'var(--text-main)' }}>
                With decades of combined experience, Gindeberet Construction has established itself as a trusted partner for complex civil infrastructure projects.
              </p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Our mission is to build safe, sustainable, and high-quality infrastructure that connects communities and drives economic growth. We pride ourselves on executing projects on time and within budget, without compromising on safety or environmental standards.
              </p>
              
              <div className="stats-container">
                <div className="stat-item">
                  <h3>{completedProjectsCount}<span>+</span></h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Projects Completed</p>
                </div>
                <div className="stat-item">
                  <h3>15<span>Yrs</span></h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Industry Experience</p>
                </div>
              </div>
            </div>
            
            <div className="about-image-wrap reveal-up" style={{ transitionDelay: '0.2s' }}>
              <img 
                src="/images/about.jpg" 
                alt="Construction engineers on site" 
                className="about-image"
              />
              <div className="about-badge">
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>ISO 9001</h4>
                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Certified Company</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Sustainability Section */}
      <section id="safety" className="safety-section">
        <div className="container">
          <div className="safety-grid">
            <div className="safety-image-wrap reveal-up">
              <img src="https://images.unsplash.com/photo-1541888087425-ce81dc8ca664?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Safety on site" className="safety-image" />
            </div>
            <div className="safety-content reveal-up" style={{ transitionDelay: '0.2s' }}>
              <h2 className="section-title">Commitment to Safety & Sustainability</h2>
              <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                We believe that zero accidents is an achievable goal. Our safety-first culture ensures that everyone goes home safely every day. Furthermore, we integrate sustainable building practices to minimize environmental impact.
              </p>
              <ul className="safety-list">
                {safetyFeatures.length > 0 ? safetyFeatures.map(feature => (
                  <li key={feature.id}><span className="check-icon">{feature.icon || '✓'}</span> <strong>{feature.title}:</strong> {feature.description}</li>
                )) : (
                  <p style={{ color: 'var(--text-muted)' }}>No safety features listed.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="reveal-up">
            <h2 className="section-title">Our Expertise</h2>
            <p className="section-subtitle" style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Delivering robust construction solutions with a focus on quality, safety, and longevity.</p>
          </div>
          
          <div className="services-grid">
            <div className="service-card reveal-up" style={{ transitionDelay: '0.1s' }}>
              <div className="service-icon-wrap">
                <span className="service-icon">🛣️</span>
              </div>
              <h3 style={{ color: 'var(--text-main)' }}>Roads & Highways</h3>
              <p style={{ color: 'var(--text-muted)' }}>Comprehensive road construction, from local streets to major interstate highways, including paving and grading.</p>
            </div>
            <div className="service-card reveal-up" style={{ transitionDelay: '0.2s' }}>
              <div className="service-icon-wrap">
                <span className="service-icon">🚆</span>
              </div>
              <h3 style={{ color: 'var(--text-main)' }}>Transit Corridors</h3>
              <p style={{ color: 'var(--text-muted)' }}>Specialized construction for light rail, bus rapid transit, and dedicated transportation corridors.</p>
            </div>
            <div className="service-card reveal-up" style={{ transitionDelay: '0.3s' }}>
              <div className="service-icon-wrap">
                <span className="service-icon">🏗️</span>
              </div>
              <h3 style={{ color: 'var(--text-main)' }}>Civil Infrastructure</h3>
              <p style={{ color: 'var(--text-muted)' }}>Underground utilities, water systems, drainage, and structural concrete work for public and private sectors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Portfolio */}
      <section id="projects" className="portfolio-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Featured Projects</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem auto', color: 'var(--text-muted)' }}>A showcase of our recent infrastructure achievements and ongoing developments.</p>
          </div>
          
          <div className="filter-container reveal-up">
            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {isLoadingProjects ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
              </div>
            ) : projectsError ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: '#EF4444' }}>{projectsError}</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)' }}>No projects to display</p>
              </div>
            ) : (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => setSelectedProject(project)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${project.title}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project); }}
                >
                  <div className="project-img-wrap">
                    <img src={getImageUrl(project.image)} alt={project.title} className="project-img" />
                    <div className="project-overlay">
                      <span className="project-view-btn">View Details →</span>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem auto', color: 'var(--text-muted)' }}>Real feedback from our partners and clients.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.length > 0 ? testimonials.map((t, i) => (
              <div key={t.id} className="testimonial-card reveal-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="quote-icon">"</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-info">
                    <h4>{t.authorName}</h4>
                    <span>{t.authorTitle}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>No testimonials added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Leadership / Our Team */}
      <section id="team" className="team-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Our Leadership</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem auto', color: 'var(--text-muted)' }}>Meet the experts driving our vision forward.</p>
          </div>
          <div className="team-grid">
            {teamMembers.length > 0 ? teamMembers.map((member, i) => (
              <div key={member.id} className="team-card reveal-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                <img src={getImageUrl(member.imageUrl)} alt={member.name} className="team-image" />
                <div className="team-info">
                  <h3>{member.name}</h3>
                  <span>{member.position}</span>
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>No team members added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Awards & Certifications */}
      <section className="awards-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Awards & Certifications</h2>
          </div>
          <div className="awards-grid reveal-up">
            {awards.length > 0 ? awards.map(award => (
              <div key={award.id} className="award-item">
                <span className="award-icon">{award.icon}</span>
                <h4>{award.title}</h4>
                <p>{award.description}</p>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>No awards listed.</p>
            )}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section id="news" className="news-section">
        <div className="container">
          <div className="reveal-up" style={{ textAlign: 'center' }}>
            <h2 className="section-title">Latest Updates</h2>
            <p className="section-subtitle" style={{ margin: '1rem auto 3rem auto', color: 'var(--text-muted)' }}>Company news, insights, and industry updates.</p>
          </div>
          <div className="news-grid">
            {newsItems.length > 0 ? newsItems.map((news, i) => (
              <div key={news.id} className="news-card reveal-up" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="news-content">
                  <span className="news-date">{news.date}</span>
                  <h3>{news.title}</h3>
                  <p>{news.excerpt}</p>
                  {news.linkUrl && <a href={news.linkUrl} className="news-link">Read More →</a>}
                </div>
              </div>
            )) : (
              <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center' }}>No news updates yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="contact-wrapper">
            <div className="contact-info reveal-up">
              <h2 className="section-title">Let's Build Together</h2>
              <p style={{ margin: '2rem 0 3rem 0', color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                Ready to start your next infrastructure project? Contact our team to discuss your requirements and how we can deliver results.
              </p>
              
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Office Location</h4>
                  <p>{getLineBreakText(siteSettings.officeLocation)}</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>{getLineBreakText(siteSettings.phone)}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h4>Working Hours</h4>
                  <p>{getLineBreakText(siteSettings.workingHours)}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>{getLineBreakText(siteSettings.email)}</p>
                </div>
              </div>

              {siteSettings.mapUrl && (
                <div className="contact-map-wrap">
                  <a
                    href={siteSettings.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-map-link"
                  >
                    <span className="contact-map-link-icon">📍</span>
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
            
            <div className="contact-form-wrap reveal-up" style={{ transitionDelay: '0.2s' }}>
              <form className="contact-form-card" onSubmit={(e) => e.preventDefault()}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--text-main)' }}>Send us a message</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>First Name</label>
                    <input type="text" className="form-control" required style={{ width: '100%' }} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Last Name</label>
                    <input type="text" className="form-control" required style={{ width: '100%' }} />
                  </div>
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
                  <input type="email" className="form-control" required style={{ width: '100%' }} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Project Type</label>
                  
                  <div className="custom-dropdown" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className={`form-control dropdown-selected ${!projectType ? 'placeholder' : ''}`}>
                      {projectType ? PROJECT_OPTIONS.find(o => o.value === projectType)?.label : 'Select an option...'}
                      <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                    </div>
                    
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        {PROJECT_OPTIONS.map(option => (
                          <div 
                            key={option.value} 
                            className={`dropdown-item ${projectType === option.value ? 'selected' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectType(option.value);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="hidden" required value={projectType} />
                </div>
                
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Message</label>
                  <textarea className="form-control" placeholder="Tell us about your project..." style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary btn-large" style={{ color: '#000', fontWeight: 700 }}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div className="footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <img src="/logo.png" alt="Gindeberet Logo" style={{ height: '48px', width: 'auto', display: 'block' }} />
                <h4 style={{ color: 'white', fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 800, margin: 0 }}>GINDEBERET<span style={{color: 'var(--cta)'}}>.</span></h4>
              </div>
              <p style={{ color: '#A1A1AA', fontSize: '0.9rem', marginTop: '1rem', lineHeight: 1.6 }}>Building the future of infrastructure with integrity, quality, and precision. We construct the paths that connect our world.</p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="#about">About Us</a>
                <a href="#projects">Portfolio</a>
                <a href="#services">Services</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Services</h4>
              <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="#">Road Construction</a>
                <a href="#">Transit Corridors</a>
                <a href="#">Civil Engineering</a>
                <a href="#">Bridge Rehabilitation</a>
                <a href="/auth" style={{ color: 'var(--cta)', marginTop: '1rem' }}>Admin Portal →</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', color: '#71717A', fontSize: '0.875rem' }}>
            <p>&copy; {new Date().getFullYear()} Gindeberet Construction. All rights reserved.</p>
          </div>
        </div>
      </footer>
      {/* Project Detail Overlay */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isDarkTheme={isDarkTheme}
        />
      )}
    </div>
  );
}

export default App;
