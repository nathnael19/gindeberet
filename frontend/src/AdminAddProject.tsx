import { useState } from 'react';
import AdminLayout from './AdminLayout';
import './AdminAddProject.css';

export default function AdminAddProject({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    category: 'Roads',
    location: '',
    budget: '',
    duration: '',
    year: '',
    status: 'pending',
    description: '',
    image: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate saving project
    alert('Project saved successfully!');
    window.location.href = '/projects';
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="projects">
      <div className="add-project-header">
        <div>
          <a href="/projects" className="back-link">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </a>
          <h1 className="page-title">Add New Project</h1>
          <p className="page-subtitle">Create a new project record in the portfolio.</p>
        </div>
      </div>

      <div className="add-project-content">
        <form className="add-project-form" onSubmit={handleSubmit}>
          
          <div className="form-section">
            <h2 className="section-heading">Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Project Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Highway 401 Expansion"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="client">Client <span className="required">*</span></label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  placeholder="e.g. Ministry of Transport"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category <span className="required">*</span></label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Roads">Roads</option>
                  <option value="Corridors">Corridors</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Bridges">Bridges</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status <span className="required">*</span></label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-heading">Details & Metrics</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Greater Metro Area"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="budget">Budget <span className="required">*</span></label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g. $42M"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g. 18 Months"
                />
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2023"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-heading">Description & Media</h2>
            <div className="form-group full-width">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a detailed description of the project..."
                rows={5}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="image">Cover Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => window.location.href = '/projects'}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
