import { useState, useEffect } from 'react';
import { type AdminProject, type ProjectStatus } from './adminData';
import { projectsApi } from './api';
import AdminLayout from './AdminLayout';
import ProjectDetail, { type Project } from './ProjectDetail';
import { formatBirr } from './format';
import './AdminProjects.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

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

const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const toProject = (p: AdminProject): Project => ({
  id: Number(p.id),
  title: p.name,
  category: p.category,
  image: p.image,
  description: p.description || 'No description available.',
  client: p.client,
  location: p.location,
  duration: p.duration,
  value: p.budget,
  year: p.year,
  status: p.status.charAt(0).toUpperCase() + p.status.slice(1),
  challenge: p.challenge,
  solution: p.solution,
  highlights: p.highlights,
  gallery: p.gallery && p.gallery.length > 0 ? p.gallery : (p.image ? [p.image] : undefined),
});

export default function AdminProjects({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch projects from API
  useEffect(() => {
    let isActive = true;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await projectsApi.getAllCached({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'All' ? undefined : categoryFilter,
          search: search || undefined,
        }, (freshResponse) => {
          if (isActive && freshResponse.success) {
            setProjects(freshResponse.data);
          }
        });

        if (!isActive) {
          return;
        }

        if (response.success) {
          setProjects(response.data);
        } else {
          setError('Failed to load projects');
        }
      } catch (err) {
        if (isActive) {
          setError('Failed to load projects');
        }
        console.error('Error fetching projects:', err);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isActive = false;
    };
  }, [statusFilter, categoryFilter, search]);

  const openDetail = (project: AdminProject) => {
    setSelectedProject(project);
  };

  const closeDetail = () => {
    setSelectedProject(null);
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="projects">
      {/* Page header */}
      <div className="projects-page-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Projects</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLoading ? 'Loading...' : `${projects.length} projects total`}
          </p>
        </div>
        <button className="add-project-btn" onClick={() => navigateTo('/projects/add')}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {/* Status pills */}
      <div className="project-stats-bar">
        {(['all', 'active', 'completed', 'pending'] as const).map((s) => (
          <button
            key={s}
            className={`stat-pill ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            <span className="stat-pill-count">
              {s === 'all' ? projects.length : projects.filter((p) => p.status === s).length}
            </span>
            <span>{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="projects-toolbar">
        <div className="projects-search">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, client, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')} aria-label="Clear search">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="projects-filters">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            {['All', 'Roads', 'Corridors', 'Infrastructure', 'Bridges'].map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`view-btn ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
              aria-label="Table view"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      {search || statusFilter !== 'all' || categoryFilter !== 'All' ? (
        <p className="results-count">
          Showing <strong>{projects.length}</strong> projects
        </p>
      ) : null}

      {/* Loading state */}
      {isLoading && (
        <div className="projects-empty">
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Loading projects...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="projects-empty">
          <p style={{ fontWeight: 600, color: '#EF4444' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && projects.length === 0 && (
        <div className="projects-empty">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>No projects yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {search || statusFilter !== 'all' || categoryFilter !== 'All' 
              ? 'No projects match your current filters. Try adjusting them or add a new project.'
              : 'Get started by adding your first project to the portfolio.'}
          </p>
        </div>
      )}

      {/* Grid view */}
      {!isLoading && !error && projects.length > 0 && view === 'grid' && (
        <div className="admin-projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="admin-project-card"
              onClick={() => openDetail(project)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openDetail(project); }}
            >
              <div className="admin-project-img-wrap">
                <img src={getImageUrl(project.image)} alt={project.name} className="admin-project-img" />
                <span className={`status-badge status-${project.status} admin-project-status`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <div className="admin-project-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="category-tag" style={{ flexShrink: 0 }}>{project.category}</span>
                </div>
                <p className="admin-project-desc">{project.description}</p>
                <div className="admin-project-meta">
                  <span>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {project.location}
                  </span>
                  <span>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {formatBirr(project.budget)}
                  </span>
                  <span>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {project.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table view */}
      {!isLoading && !error && projects.length > 0 && view === 'table' && (
        <div className="panel">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Budget</th>
                  <th>Year</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                    <tr key={project.id} style={{ cursor: 'pointer' }} onClick={() => openDetail(project)}>
                    <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{project.name}</td>
                    <td>{project.client}</td>
                    <td><span className="category-tag">{project.category}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{project.location}</td>
                    <td style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{formatBirr(project.budget)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{project.year}</td>
                    <td><span className={`status-badge status-${project.status}`}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail preview */}
      {selectedProject && (
        <ProjectDetail
          project={toProject(selectedProject)}
          onClose={closeDetail}
          isDarkTheme={isDarkTheme}
          onEdit={() => navigateTo(`/projects/add?edit=${selectedProject.id}`)}
        />
      )}
    </AdminLayout>
  );
}
