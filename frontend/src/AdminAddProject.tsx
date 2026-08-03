import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { projectsApi, uploadApi } from './api';
import AdminLayout from './AdminLayout';
import { formatNumber } from './format';
import './AdminAddProject.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
const DEFAULT_COVER_IMAGE = 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const getImageUrl = (imagePath: string) => {
  if (!imagePath) return DEFAULT_COVER_IMAGE;

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

const createEmptyForm = () => ({
  name: '',
  client: '',
  category: 'Roads',
  location: '',
  budget: '',
  duration: '',
  year: '',
  status: 'pending',
  description: '',
});

export default function AdminAddProject({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [formData, setFormData] = useState(createEmptyForm());
  const [projectId, setProjectId] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  const [existingImageUrl, setExistingImageUrl] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const editId = searchParams.get('edit');

    if (!editId) {
      return;
    }

    let isActive = true;

    const loadProject = async () => {
      try {
        setIsEditMode(true);
        setIsLoadingProject(true);
        setError('');

        const response = await projectsApi.getById(editId);

        if (!isActive) {
          return;
        }

        if (!response.success || !response.data) {
          setError('Project not found');
          return;
        }

        const project = response.data;
        setProjectId(project.id);
        setFormData({
          name: project.name || '',
          client: project.client || '',
          category: project.category || 'Roads',
          location: project.location || '',
          budget: project.budget || '',
          duration: project.duration || '',
          year: project.year || '',
          status: project.status || 'pending',
          description: project.description || '',
        });
        setExistingImageUrl(project.image || '');
        setCoverPreview(project.image ? getImageUrl(project.image) : '');
        setExistingGallery(Array.isArray(project.gallery) ? project.gallery : []);
      } catch (loadError) {
        console.error('Error loading project for edit:', loadError);
        if (isActive) {
          setError('Failed to load project');
        }
      } finally {
        if (isActive) {
          setIsLoadingProject(false);
        }
      }
    };

    loadProject();

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: name === 'budget' ? formatNumber(value) : value }));
  };

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearCoverSelection = () => {
    setCoverImage(null);
    setCoverPreview(isEditMode ? getImageUrl(existingImageUrl) : '');
  };

  const handleGalleryChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }

    const files = Array.from(event.target.files);
    setGalleryImages((currentFiles) => [...currentFiles, ...files]);
    setGalleryPreviews((currentPreviews) => [...currentPreviews, ...files.map((file) => URL.createObjectURL(file))]);
    event.target.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index));
    setGalleryPreviews((currentPreviews) => currentPreviews.filter((_, previewIndex) => previewIndex !== index));
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery((currentGallery) => currentGallery.filter((_, galleryIndex) => galleryIndex !== index));
  };

  const generateProjectId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PRJ-${timestamp}${random}`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const nextProjectId = isEditMode ? projectId : generateProjectId();

      let imageUrl = existingImageUrl || DEFAULT_COVER_IMAGE;
      if (coverImage) {
        const uploadResponse = await uploadApi.uploadImage(coverImage);
        imageUrl = uploadResponse.data.url;
      }

      let galleryUrls = [...existingGallery];
      if (galleryImages.length > 0) {
        const uploadResponse = await uploadApi.uploadImages(galleryImages);
        galleryUrls = [...galleryUrls, ...uploadResponse.data.map((file) => file.url)];
      }

      const projectData = {
        id: nextProjectId,
        name: formData.name,
        client: formData.client,
        category: formData.category,
        status: formData.status,
        location: formData.location,
        budget: formData.budget,
        duration: formData.duration,
        year: formData.year,
        description: formData.description,
        image: imageUrl,
        gallery: galleryUrls,
      };

      const response = isEditMode
        ? await projectsApi.update(projectId, projectData)
        : await projectsApi.create(projectData);

      if (!response.success) {
        throw new Error(isEditMode ? 'Failed to update project' : 'Failed to create project');
      }

      navigateTo('/projects');
    } catch (submitError) {
      console.error('Error saving project:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="projects">
      <div className="add-project-header">
        <div>
          <a href="/projects" className="back-link" onClick={(event) => { event.preventDefault(); navigateTo('/projects'); }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </a>
          <h1 className="page-title">{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
          <p className="page-subtitle">
            {isEditMode ? 'Update the project details and media.' : 'Create a new project record in the portfolio.'}
          </p>
        </div>
      </div>

      <div className="add-project-content">
        {isLoadingProject ? (
          <div className="projects-empty">
            <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Loading project...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message" style={{
                backgroundColor: '#FEE2E2',
                color: '#B91C1C',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                {error}
              </div>
            )}

            <form className="add-project-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="section-heading">Basic Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Project Name <span className="required">*</span></label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Highway 401 Expansion" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="client">Client <span className="required">*</span></label>
                    <input type="text" id="client" name="client" value={formData.client} onChange={handleChange} placeholder="e.g. Ministry of Transport" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category <span className="required">*</span></label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required>
                      <option value="Roads">Roads</option>
                      <option value="Corridors">Corridors</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Bridges">Bridges</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status <span className="required">*</span></label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} required>
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
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Greater Metro Area" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="budget">Budget <span className="required">*</span></label>
                    <input type="text" id="budget" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g. 40,000,000 (ETB)" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="duration">Duration</label>
                    <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 18 Months" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <input type="text" id="year" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. 2023" />
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

                <div className="media-grid">
                <div className="form-group full-width">
                  <label>Cover Image</label>
                  <input type="file" id="cover-upload" accept="image/*" onChange={handleCoverChange} className="file-input-hidden" ref={coverInputRef} />
                  {!(coverPreview || (isEditMode && existingImageUrl)) && (
                    <div className="upload-container">
                      <label htmlFor="cover-upload" className="upload-dropzone">
                        <div className="upload-content">
                          <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{isEditMode ? 'Click to replace cover image' : 'Click to upload cover image'}</span>
                          <span className="upload-hint">PNG, JPG, WEBP up to 5MB</span>
                        </div>
                      </label>
                    </div>
                  )}

                  {(coverPreview || (isEditMode && existingImageUrl)) && (
                    <div className="image-preview clickable" onClick={() => coverInputRef.current?.click()}>
                      <img src={coverPreview || getImageUrl(existingImageUrl)} alt="Cover Preview" />
                      <span className="image-preview-overlay">Click to replace</span>
                      <button type="button" className="remove-image-btn" onClick={(event) => { event.stopPropagation(); clearCoverSelection(); }}>
                        &times;
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Gallery Images</label>
                  <div className="upload-container">
                    <input type="file" id="gallery-upload" accept="image/*" multiple onChange={handleGalleryChange} className="file-input-hidden" />
                    <label htmlFor="gallery-upload" className="upload-dropzone upload-dropzone-small">
                      <div className="upload-content">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Upload gallery images</span>
                        <span className="upload-hint">Upload multiple</span>
                      </div>
                    </label>
                  </div>

                  {existingGallery.length > 0 && (
                    <>
                      <h3 className="section-heading" style={{ marginTop: '1rem', fontSize: '1rem' }}>Existing Gallery</h3>
                      <div className="gallery-preview-grid">
                        {existingGallery.map((image, index) => (
                          <div key={`${image}-${index}`} className="gallery-preview-item">
                            <img src={getImageUrl(image)} alt={`Existing gallery ${index + 1}`} />
                            <button type="button" className="remove-image-btn" onClick={() => removeExistingGalleryImage(index)}>
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {galleryPreviews.length > 0 && (
                    <>
                      <h3 className="section-heading" style={{ marginTop: '1rem', fontSize: '1rem' }}>New Gallery Uploads</h3>
                      <div className="gallery-preview-grid">
                        {galleryPreviews.map((preview, index) => (
                          <div key={`${preview}-${index}`} className="gallery-preview-item">
                            <img src={preview} alt={`Gallery ${index + 1}`} />
                            <button type="button" className="remove-image-btn" onClick={() => removeGalleryImage(index)}>
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => navigateTo('/projects')} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isSaving}>
                  {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Project' : 'Save Project')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
