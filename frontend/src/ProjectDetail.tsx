import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getImageUrl } from './imageUrl';
import './ProjectDetail.css';

export interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  // Extended fields for the detail page
  client?: string;
  location?: string;
  duration?: string;
  value?: string;
  year?: string;
  status?: string;
  challenge?: string;
  solution?: string;
  highlights?: string[];
  gallery?: string[];
}

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  isDarkTheme: boolean;
  onEdit?: () => void;
}

export default function ProjectDetail({ project, onClose, isDarkTheme, onEdit }: ProjectDetailProps) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return createPortal(
    <div className="pd-overlay" role="dialog" aria-modal="true" aria-label={`${project.title} details`}>
      {/* Backdrop click to close */}
      <div className="pd-backdrop" onClick={onClose} />

      <div className={`pd-panel ${isDarkTheme ? 'dark' : ''}`}>
        {/* Hero */}
        <div className="pd-hero">
          <img src={getImageUrl(project.image)} alt={project.title} className="pd-hero-img" />
          <div className="pd-hero-overlay" />

          {/* Close button */}
          <button className="pd-close-btn" onClick={onClose} aria-label="Close project details">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="pd-hero-content">
            <span className="pd-category">{project.category}</span>
            <h1 className="pd-title">{project.title}</h1>
            <div className="pd-meta-row">
              {project.location && (
                <span className="pd-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {project.location}
                </span>
              )}
              {project.year && (
                <span className="pd-meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {project.year}
                </span>
              )}
              {project.status && (
                <span className={`pd-status ${project.status === 'Completed' ? 'completed' : 'ongoing'}`}>
                  {project.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pd-body">
          {/* Stats strip */}
          <div className="pd-stats-strip">
            {project.client && (
              <div className="pd-stat">
                <span className="pd-stat-label">Client</span>
                <span className="pd-stat-value">{project.client}</span>
              </div>
            )}
            {project.duration && (
              <div className="pd-stat">
                <span className="pd-stat-label">Duration</span>
                <span className="pd-stat-value">{project.duration}</span>
              </div>
            )}
            {project.value && (
              <div className="pd-stat">
                <span className="pd-stat-label">Contract Value</span>
                <span className="pd-stat-value">{project.value}</span>
              </div>
            )}
            {project.location && (
              <div className="pd-stat">
                <span className="pd-stat-label">Location</span>
                <span className="pd-stat-value">{project.location}</span>
              </div>
            )}
          </div>

          {/* Content grid */}
          <div className="pd-content-grid">
            {/* Left column */}
            <div className="pd-col-main">
              <section className="pd-section">
                <h2 className="pd-section-title">Project Overview</h2>
                <p className="pd-section-text">{project.description}</p>
              </section>

              {project.challenge && (
                <section className="pd-section">
                  <h2 className="pd-section-title">The Challenge</h2>
                  <p className="pd-section-text">{project.challenge}</p>
                </section>
              )}

              {project.solution && (
                <section className="pd-section">
                  <h2 className="pd-section-title">Our Approach</h2>
                  <p className="pd-section-text">{project.solution}</p>
                </section>
              )}

              {/* Gallery */}
              {project.gallery && project.gallery.length > 0 && (
                <section className="pd-section">
                  <h2 className="pd-section-title">Project Gallery</h2>
                  <div className="pd-gallery">
                    {project.gallery.map((src, i) => (
                      <div key={i} className="pd-gallery-item">
                        <img src={getImageUrl(src)} alt={`${project.title} - photo ${i + 1}`} loading="lazy" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <div className="pd-col-side">
              {onEdit && (
                <button type="button" className="pd-edit-btn" onClick={onEdit}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Project
                </button>
              )}
              {project.highlights && project.highlights.length > 0 && (
                <div className="pd-highlights-card">
                  <h3 className="pd-highlights-title">Key Highlights</h3>
                  <ul className="pd-highlights-list">
                    {project.highlights.map((item, i) => (
                      <li key={i} className="pd-highlight-item">
                        <span className="pd-check">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pd-cta-card">
                <h3>Interested in a similar project?</h3>
                <p>Talk to our team and let's explore what we can build together.</p>
                <a href="#contact" onClick={onClose} className="btn btn-primary pd-cta-btn">
                  Get in Touch
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
