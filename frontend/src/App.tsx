import { useState, useEffect, useRef } from 'react';
import './App.css';
import ProjectDetail, { type Project } from './ProjectDetail';
import AdminLogin from './AdminLogin';
import ForgotPassword from './ForgotPassword';
import NewPassword from './NewPassword';

const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Highway 401 Expansion',
    category: 'Roads',
    image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Major highway expansion project including 3 new lanes and 2 overpasses, completed 3 months ahead of schedule. This project transformed one of the city\'s most congested arterial routes into a modern, multi-lane corridor capable of handling 60,000+ vehicles per day.',
    client: 'Ministry of Transport',
    location: 'Greater Metro Area',
    duration: '18 Months',
    value: '$42M',
    year: '2023',
    status: 'Completed',
    challenge: 'The existing two-lane highway was a critical chokepoint causing daily gridlock. The expansion had to be completed while maintaining live traffic flow in both directions — a logistical challenge requiring round-the-clock shift scheduling and precision lane management.',
    solution: 'We deployed a phased construction approach, using temporary traffic management systems and pre-cast concrete panels to minimize lane closures. Advanced sensor arrays were installed to monitor traffic patterns in real time, allowing our crews to adapt schedules dynamically and keep delays below 12 minutes at peak hours.',
    highlights: [
      'Completed 3 months ahead of schedule',
      '3 new lanes added each direction',
      '2 new overpasses constructed',
      'Zero major safety incidents',
      'Live traffic maintained throughout',
      'LEED Silver certified earthworks'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 2,
    title: 'Metro Transit Corridor',
    category: 'Corridors',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb6d646df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: '15km dedicated transit corridor with 8 new stations integrating smart traffic management systems. The corridor connects the downtown core to two major suburban employment hubs, reducing average commute times by 34%.',
    client: 'City Transit Authority',
    location: 'Downtown to Eastside',
    duration: '28 Months',
    value: '$115M',
    year: '2022',
    status: 'Completed',
    challenge: 'The corridor ran through a densely built urban environment with extensive underground utility networks, requiring careful coordination with 14 different municipal utility providers to avoid service disruptions.',
    solution: 'Using 3D subsurface mapping technology, we identified every utility line along the route before a single shovel hit the ground. Micro-tunneling techniques allowed us to install station infrastructure beneath live roads without cutting surface lanes.',
    highlights: [
      '15km of dedicated bus lanes',
      '8 new transit stations built',
      'Smart traffic signal integration',
      '34% reduction in commute time',
      'Fully accessible design (AODA compliant)',
      'Real-time passenger information systems'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1474487548417-781cb6d646df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1567521464027-f127ff144326?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 3,
    title: 'Downtown Utility Upgrade',
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Complete replacement of century-old water and sewer mains serving 80,000 residents, with minimal public disruption and no planned service outages exceeding 4 hours.',
    client: 'City Waterworks Dept.',
    location: 'Central Business District',
    duration: '14 Months',
    value: '$28M',
    year: '2023',
    status: 'Completed',
    challenge: 'The existing cast-iron mains dated back to 1924 and ran beneath some of the city\'s busiest streets and historic building foundations. Any significant ground disturbance risked damaging adjacent structures.',
    solution: 'We utilized trenchless pipe-bursting and slip-lining techniques, replacing 12km of main lines without excavating the road surface in 85% of locations. Night-time work windows were agreed with local businesses to protect daytime foot traffic.',
    highlights: [
      '12km of mains replaced',
      'Zero unplanned service outages',
      'Trenchless methods used in 85% of sections',
      'Water loss reduced by 22%',
      'Historic building foundations protected',
      'Full project completed on budget'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 4,
    title: 'River Bridge Rehabilitation',
    category: 'Bridges',
    image: 'https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Structural reinforcement and full deck replacement of a 90-year-old heritage bridge using advanced fiber-reinforced polymer composites, extending its service life by 75 years.',
    client: 'Regional Roads Board',
    location: 'Northgate River Crossing',
    duration: '22 Months',
    value: '$67M',
    year: '2021',
    status: 'Completed',
    challenge: 'The bridge carried both vehicle and pedestrian traffic and held heritage designation, meaning the exterior facade had to be preserved exactly while the internal structure was comprehensively rebuilt. Flooding risk during spring runoff added further complexity.',
    solution: 'A temporary bridge deck system allowed traffic to continue at reduced capacity during the full deck removal. We engineered custom fiber-reinforced polymer (FRP) deck panels that are 4× lighter than concrete but meet the same load ratings, reducing dead load on the rehabilitated steel trusses.',
    highlights: [
      'Heritage facade 100% preserved',
      'FRP deck panels — 4× lighter than concrete',
      'Service life extended by 75 years',
      'Traffic maintained at 60% capacity throughout',
      'Load rating upgraded from Class A to Class AA',
      'Flood mitigation improvements included'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1529701870823-46c29b3ef5a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 5,
    title: 'Valley Parkway',
    category: 'Roads',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'New 8km scenic parkway through an environmentally sensitive valley, built with fully recycled asphalt and a zero-net-disturbance environmental strategy.',
    client: 'Parks & Recreation Dept.',
    location: 'Green Valley Corridor',
    duration: '16 Months',
    value: '$19M',
    year: '2024',
    status: 'Completed',
    challenge: 'The route passed through a protected wildlife corridor. All construction had to adhere to a strict environmental management plan, with seasonal work bans during migration periods and drainage systems designed to prevent any sediment runoff into the adjacent river.',
    solution: 'We worked closely with environmental consultants to develop a corridor-sensitive construction methodology. 100% recycled asphalt was used for the road base, and bio-retention swales were built alongside the road to filter any runoff before it reaches natural waterways.',
    highlights: [
      '100% recycled asphalt road base',
      'Zero net disturbance environmental strategy',
      'Wildlife crossing underpasses installed',
      'Bio-retention stormwater management',
      'Seasonal construction windows respected',
      'Net carbon negative construction'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 6,
    title: 'Industrial Park Grid',
    category: 'Infrastructure',
    image: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'High-capacity water distribution network and stormwater system for a 500-acre greenfield manufacturing hub designed to accommodate 35 industrial tenants.',
    client: 'Eastport Development Corp.',
    location: 'Eastport Industrial Zone',
    duration: '20 Months',
    value: '$54M',
    year: '2024',
    status: 'Ongoing',
    challenge: 'The site was a previously contaminated brownfield. All underground work had to follow strict remediation protocols, and the network design needed to accommodate phased tenant move-ins while the broader park was still under construction.',
    solution: 'We designed a modular distribution ring system that could serve individual sections independently before the full loop was connected. Pre-fabricated valve chamber assemblies cut installation time by 40% compared to cast-in-place methods.',
    highlights: [
      '500-acre greenfield development',
      'Serves 35 industrial tenants',
      'Modular distribution ring design',
      'Brownfield remediation completed first',
      '40% faster valve chamber installation',
      'Phased commissioning for early tenants'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ]
  }
];

const CATEGORIES = ['All', 'Roads', 'Corridors', 'Infrastructure', 'Bridges'];

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  
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
    ? PROJECTS 
    : PROJECTS.filter(p => p.category === activeFilter);

  if (currentRoute === '/admin') {
    return <AdminLogin isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/forgot-password' || currentRoute === '/forgot-password/') {
    return <ForgotPassword isDarkTheme={isDarkTheme} />;
  }

  if (currentRoute === '/new-password' || currentRoute === '/new-password/') {
    return <NewPassword isDarkTheme={isDarkTheme} />;
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
                  <h3>50<span>+</span></h3>
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
            {filteredProjects.map((project, index) => (
              <div
                key={project.id}
                className="project-card reveal-up"
                style={{ transitionDelay: `${(index % 3) * 0.1}s` }}
                onClick={() => setSelectedProject(project)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${project.title}`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProject(project); }}
              >
                <div className="project-img-wrap">
                  <img src={project.image} alt={project.title} className="project-img" />
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
            ))}
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
                  <p>123 Industrial Way<br/>Builder City, BC 12345</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>(555) 123-4567<br/>Mon-Fri, 8am-6pm</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>info@gindeberet.com<br/>careers@gindeberet.com</p>
                </div>
              </div>
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
                <a href="/admin" style={{ color: 'var(--cta)', marginTop: '1rem' }}>Admin Portal →</a>
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
