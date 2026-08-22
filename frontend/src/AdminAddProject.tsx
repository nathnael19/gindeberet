import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { projectsApi, uploadApi } from './api';
import AdminLayout from './AdminLayout';
import { formatNumber } from './format';
import { getImageUrl } from './imageUrl';
import './AdminAddProject.css';

const DEFAULT_COVER_IMAGE =
  'https://images.unsplash.com/photo-1545459720-aac8509eb02c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';

import { adminNavigate } from './adminNav';

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
  challenge: '',
  solution: '',
  highlights: '',
  isPublic: false,
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
  const [galleryReplacements, setGalleryReplacements] = useState<Record<number, File>>({});
  const [galleryReplacementPreviews, setGalleryReplacementPreviews] = useState<Record<number, string>>({});
  const galleryReplaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingGalleryIndex, setReplacingGalleryIndex] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.querySelector('.dashboard-content')?.scrollTo({ top: 0, left: 0, behavior: 'instant' });

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
          challenge: project.challenge || '',
          solution: project.solution || '',
          highlights: Array.isArray(project.highlights) ? project.highlights.join('\n') : (project.highlights || ''),
          isPublic: Boolean(project.isPublic),
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
    setGalleryReplacements((current) => {
      const next = { ...current };
      delete next[index];
      return next;
    });
    setGalleryReplacementPreviews((current) => {
      const next = { ...current };
      delete next[index];
      return next;
    });
  };

  const startReplaceGalleryImage = (index: number) => {
    setReplacingGalleryIndex(index);
    galleryReplaceInputRef.current?.click();
  };

  const handleGalleryReplaceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && replacingGalleryIndex !== null) {
      setGalleryReplacements((current) => ({ ...current, [replacingGalleryIndex]: file }));
      setGalleryReplacementPreviews((current) => ({
        ...current,
        [replacingGalleryIndex]: URL.createObjectURL(file),
      }));
    }
    setReplacingGalleryIndex(null);
    event.target.value = '';
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
      for (const [indexStr, file] of Object.entries(galleryReplacements)) {
        const index = Number(indexStr);
        const uploadResponse = await uploadApi.uploadImage(file);
        if (index >= 0 && index < galleryUrls.length) {
          galleryUrls[index] = uploadResponse.data.url;
        }
      }
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
        challenge: formData.challenge,
        solution: formData.solution,
        highlights: formData.highlights.split('\n').map((item) => item.trim()).filter(Boolean),
        image: imageUrl,
        gallery: galleryUrls,
        isPublic: formData.isPublic,
      };

      const response = isEditMode
        ? await projectsApi.update(projectId, projectData)
        : await projectsApi.create(projectData);

      if (!response.success) {
        throw new Error(isEditMode ? 'Failed to update project' : 'Failed to create project');
      }

      adminNavigate('/projects');
    } catch (submitError) {
      console.error('Error saving project:', submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await projectsApi.delete(projectId);
      if (!response.success) {
        throw new Error('Failed to delete project');
      }
      adminNavigate('/projects');
    } catch (deleteError) {
      console.error('Error deleting project:', deleteError);
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="projects">
      <div className="add-project-header">
        <div>
          <a href="/projects" className="back-link" onClick={(event) => { event.preventDefault(); adminNavigate('/projects'); }}>
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
                      <option value="Buildings">Buildings</option>
                      <option value="Water">Water</option>
                      <option value="Electro-Mechanical">Electro-Mechanical</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Corridors">Corridors</option>
                      <option value="Bridges">Bridges</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Commercial">Commercial</option>
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
                  <div className="form-group">
                    <label htmlFor="isPublic">Website visibility</label>
                    <label className="publish-check">
                      <input
                        id="isPublic"
                        name="isPublic"
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isPublic: e.target.checked }))}
                      />
                      <span>Publish on public website</span>
                    </label>
                    <p className="field-hint">Leave unchecked to keep the project in the admin dashboard only.</p>
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
                <h2 className="section-heading">Project Story</h2>
                <p className="page-subtitle" style={{ marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
                  These sections appear on the project detail page.
                </p>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="challenge">The Challenge</label>
                    <textarea
                      id="challenge"
                      name="challenge"
                      value={formData.challenge}
                      onChange={handleChange}
                      placeholder="Describe the challenges this project faced..."
                      rows={4}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="solution">Our Approach</label>
                    <textarea
                      id="solution"
                      name="solution"
                      value={formData.solution}
                      onChange={handleChange}
                      placeholder="Describe how your team solved the challenge..."
                      rows={4}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="highlights">Key Highlights</label>
                    <textarea
                      id="highlights"
                      name="highlights"
                      value={formData.highlights}
                      onChange={handleChange}
                      placeholder={'One highlight per line, e.g.\nDelivered 2 weeks early\nLEED Silver design'}
                      rows={4}
                    />
                    <span className="upload-hint">One highlight per line. Leave blank to hide this section.</span>
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
                          <span className="upload-hint">PNG, JPG, WEBP up to 10MB</span>
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
                  <input
                    type="file"
                    ref={galleryReplaceInputRef}
                    accept="image/*"
                    className="file-input-hidden"
                    onChange={handleGalleryReplaceChange}
                  />
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
                      <p className="upload-hint" style={{ marginBottom: '0.75rem' }}>Click a photo to replace it, or use × to remove.</p>
                      <div className="gallery-preview-grid">
                        {existingGallery.map((image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className="gallery-preview-item clickable"
                            onClick={() => startReplaceGalleryImage(index)}
                          >
                            <img
                              src={galleryReplacementPreviews[index] || getImageUrl(image)}
                              alt={`Existing gallery ${index + 1}`}
                            />
                            <span className="image-preview-overlay">
                              {galleryReplacements[index] ? 'Replace selected' : 'Click to replace'}
                            </span>
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                removeExistingGalleryImage(index);
                              }}
                            >
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
                {isEditMode && (
                  <button type="button" className="btn-delete" onClick={() => { setError(''); setShowDeleteConfirm(true); }} disabled={isSaving || isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                  </button>
                )}
                <button type="button" className="btn-cancel" onClick={() => adminNavigate('/projects')} disabled={isSaving || isDeleting}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={isSaving || isDeleting}>
                  {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Project' : 'Save Project')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="Confirm project deletion">
          <div className="confirm-modal">
            <div className="confirm-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="confirm-title">Delete this project?</h2>
            <p className="confirm-text">
              Are you sure you want to delete{' '}
              <strong>{formData.name || 'this project'}</strong>? This action cannot be undone.
            </p>
            {error && (
              <div className="confirm-error">
                {error}
              </div>
            )}
            <div className="confirm-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="btn-delete confirm-delete" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
