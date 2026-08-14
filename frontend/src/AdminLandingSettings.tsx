import { useEffect, useState, type FormEvent } from 'react';
import { landingApi, uploadApi } from './api';
import { getImageUrl } from './imageUrl';

type SectionId =
  | 'hero'
  | 'services'
  | 'partners'
  | 'safety'
  | 'testimonials'
  | 'team'
  | 'awards'
  | 'news'
  | 'facilities';

const SECTIONS: { id: SectionId; label: string; hint: string }[] = [
  {
    id: 'hero',
    label: 'Hero Slider',
    hint: 'Background images and headline text that animate on the home page hero.',
  },
  {
    id: 'services',
    label: 'Services',
    hint: 'Service cards on the home page, Services list, and detail pages.',
  },
  { id: 'partners', label: 'Partners', hint: 'Logos shown in the partners strip on the home page.' },
  { id: 'safety', label: 'Safety & Sustainability', hint: 'Feature cards for safety and sustainability.' },
  { id: 'testimonials', label: 'Testimonials', hint: 'Client quotes on the landing page.' },
  { id: 'team', label: 'Leadership Team', hint: 'Team members shown on the About page.' },
  { id: 'awards', label: 'Awards', hint: 'Recognition / award highlights.' },
  {
    id: 'news',
    label: 'Latest Updates',
    hint: 'News, events, and announcements shown in Latest Updates on the home page.',
  },
  {
    id: 'facilities',
    label: 'Office & Facilities',
    hint: 'Photos and captions for the Office & Facilities gallery on the About page.',
  },
];

const EDITABLE: Record<SectionId, string[]> = {
  hero: ['title1', 'title2', 'line', 'imageUrl', 'sortOrder'],
  services: [
    'slug',
    'indexLabel',
    'title',
    'lead',
    'category',
    'points',
    'overview',
    'approach',
    'outcomes',
    'heroImage',
    'sortOrder',
  ],
  partners: ['name', 'logoUrl'],
  safety: ['title', 'description', 'icon'],
  testimonials: ['text', 'authorName', 'authorTitle'],
  team: ['name', 'position', 'imageUrl'],
  awards: ['title', 'description', 'icon', 'imageUrl'],
  news: ['title', 'excerpt', 'date', 'category', 'imageUrl', 'linkUrl', 'sortOrder'],
  facilities: ['title', 'description', 'imageUrl', 'sortOrder'],
};

function linesToText(value: unknown) {
  if (Array.isArray(value)) return value.join('\n');
  return value != null ? String(value) : '';
}

function prepareItemForEdit(section: SectionId, item: any) {
  if (section !== 'services') return { ...item };
  return {
    ...item,
    indexLabel: item.indexLabel || item.index || '',
    points: linesToText(item.points),
    approach: linesToText(item.approach),
    outcomes: linesToText(item.outcomes),
  };
}

function itemLabel(item: any) {
  if (item.title1 || item.title2) {
    return [item.title1, item.title2].filter(Boolean).join(' ');
  }
  return item.name || item.title || item.authorName || (item.text ? `${String(item.text).slice(0, 40)}…` : `Item #${item.id}`);
}

function itemSubtitle(section: SectionId, item: any) {
  switch (section) {
    case 'hero':
      return item.line || (item.imageUrl ? 'Has image' : 'No image');
    case 'services':
      return [item.category, item.slug].filter(Boolean).join(' · ');
    case 'partners':
      return item.logoUrl ? 'Has logo' : 'Name only';
    case 'safety':
    case 'awards':
      return item.description || '';
    case 'testimonials':
      return item.authorTitle || '';
    case 'team':
      return item.position || '';
    case 'news':
      return [item.category, item.date].filter(Boolean).join(' · ');
    case 'facilities':
      return item.description || (item.imageUrl ? 'Has photo' : 'No photo');
    default:
      return '';
  }
}

function toPayload(section: SectionId, item: any) {
  const payload: Record<string, string> = {};
  for (const key of EDITABLE[section]) {
    payload[key] = item[key] != null ? String(item[key]) : '';
  }
  if (section === 'services' && !payload.slug && payload.title) {
    payload.slug = payload.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return payload;
}

export default function AdminLandingSettings() {
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sectionMeta = SECTIONS.find((s) => s.id === activeSection)!;

  const fetchSectionData = async (sectionId: SectionId) => {
    setIsLoading(true);
    setError('');
    setData([]);
    try {
      const res = await landingApi.getSection(sectionId);
      if (res.success) setData(res.data || []);
      else setError('Failed to load section');
    } catch (err: any) {
      setError(err?.message || 'Failed to load section');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData(activeSection);
  }, [activeSection]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const payload = toPayload(activeSection, currentItem);
      if (currentItem.id) {
        await landingApi.updateItem(activeSection, currentItem.id, payload);
        setMessage('Item updated');
      } else {
        await landingApi.createItem(activeSection, payload);
        setMessage('Item created');
      }
      setIsEditing(false);
      setCurrentItem({});
      await fetchSectionData(activeSection);
    } catch (err: any) {
      setError(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item? It will disappear from the public site.')) return;
    setError('');
    setMessage('');
    try {
      await landingApi.deleteItem(activeSection, id);
      setMessage('Item deleted');
      await fetchSectionData(activeSection);
    } catch (err: any) {
      setError(err?.message || 'Delete failed');
    }
  };

  const uploadImage = async (file: File, field: 'logoUrl' | 'imageUrl' | 'heroImage') => {
    setUploading(true);
    setError('');
    try {
      const res = await uploadApi.uploadImage(file);
      if (!res.success || !res.data?.url) throw new Error('Upload failed');
      setCurrentItem((prev: any) => ({ ...prev, [field]: res.data.url }));
    } catch (err: any) {
      setError(err?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const renderFormFields = () => {
    switch (activeSection) {
      case 'services':
        return (
          <>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Title *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.title || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                  placeholder="e.g. Road Construction"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Slug *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.slug || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                  placeholder="road-construction"
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Index label *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.indexLabel || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, indexLabel: e.target.value })}
                  placeholder="01"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Category *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.category || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                  placeholder="Roads, Buildings, Water…"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Sort order</label>
                <input
                  type="number"
                  className="settings-input"
                  min={0}
                  value={currentItem.sortOrder ?? 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, sortOrder: e.target.value })}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Short lead *</label>
              <textarea
                className="settings-input"
                required
                rows={2}
                value={currentItem.lead || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, lead: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Overview *</label>
              <textarea
                className="settings-input"
                required
                rows={4}
                value={currentItem.overview || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, overview: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Key points * (one per line)</label>
              <textarea
                className="settings-input"
                required
                rows={4}
                value={currentItem.points || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, points: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Approach * (one per line)</label>
              <textarea
                className="settings-input"
                required
                rows={4}
                value={currentItem.approach || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, approach: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Outcomes * (one per line)</label>
              <textarea
                className="settings-input"
                required
                rows={3}
                value={currentItem.outcomes || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, outcomes: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Hero / card image *</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.heroImage || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, heroImage: e.target.value })}
                  placeholder="/uploads/… or https://…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'heroImage');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.heroImage && (
                <img
                  className="landing-preview landing-preview--wide"
                  src={getImageUrl(currentItem.heroImage)}
                  alt="Service preview"
                />
              )}
            </div>
          </>
        );
      case 'hero':
        return (
          <>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Title line 1 *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.title1 || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title1: e.target.value })}
                  placeholder="e.g. Quality,"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Title line 2 *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.title2 || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, title2: e.target.value })}
                  placeholder="e.g. Not Quantity"
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Yellow highlight line *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.line || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, line: e.target.value })}
                placeholder="Short line under the title"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Background image *</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.imageUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                  placeholder="/uploads/… or https://…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'imageUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.imageUrl && (
                <img
                  className="landing-preview landing-preview--wide"
                  src={getImageUrl(currentItem.imageUrl)}
                  alt="Hero preview"
                />
              )}
            </div>
            <div className="field-group">
              <label className="field-label">Sort order</label>
              <input
                type="number"
                className="settings-input"
                min={0}
                value={currentItem.sortOrder ?? 0}
                onChange={(e) => setCurrentItem({ ...currentItem, sortOrder: e.target.value })}
                placeholder="0"
              />
              <p className="settings-card-desc" style={{ marginTop: '0.35rem' }}>
                Lower numbers appear first in the slider.
              </p>
            </div>
          </>
        );
      case 'partners':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Partner name *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.name || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                placeholder="e.g. Ethio Telecom"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Logo</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  value={currentItem.logoUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, logoUrl: e.target.value })}
                  placeholder="/uploads/… or https://…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'logoUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.logoUrl && (
                <img className="landing-preview" src={getImageUrl(currentItem.logoUrl)} alt="Logo preview" />
              )}
            </div>
          </>
        );
      case 'safety':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Description *</label>
              <textarea
                className="settings-input"
                required
                rows={3}
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Icon (emoji or short text)</label>
              <input
                type="text"
                className="settings-input"
                value={currentItem.icon || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                placeholder="✓"
              />
            </div>
          </>
        );
      case 'testimonials':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Quote *</label>
              <textarea
                className="settings-input"
                required
                rows={4}
                value={currentItem.text || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, text: e.target.value })}
              />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Author name *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.authorName || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, authorName: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Author title *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.authorTitle || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, authorTitle: e.target.value })}
                />
              </div>
            </div>
          </>
        );
      case 'team':
        return (
          <>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Name *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.name || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Position *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.position || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, position: e.target.value })}
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Photo</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  value={currentItem.imageUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                  placeholder="/uploads/… or https://…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'imageUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.imageUrl && (
                <img className="landing-preview landing-preview--avatar" src={getImageUrl(currentItem.imageUrl)} alt="Photo preview" />
              )}
            </div>
          </>
        );
      case 'awards':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Description *</label>
              <textarea
                className="settings-input"
                required
                rows={3}
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
              />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Index / icon *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.icon || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                  placeholder="01"
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Certificate / award image</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  value={currentItem.imageUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                  placeholder="/images/awards/… or /uploads/…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'imageUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.imageUrl && (
                <img
                  className="landing-preview landing-preview--wide"
                  src={getImageUrl(currentItem.imageUrl)}
                  alt="Award preview"
                />
              )}
            </div>
          </>
        );
      case 'facilities':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                placeholder="Head Office — Addis Ababa"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Short description</label>
              <textarea
                className="settings-input"
                rows={3}
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                placeholder="Location or what this facility is used for…"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Photo *</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.imageUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                  placeholder="/uploads/… or https://…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'imageUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.imageUrl && (
                <img
                  className="landing-preview landing-preview--wide"
                  src={getImageUrl(currentItem.imageUrl)}
                  alt="Facility preview"
                />
              )}
            </div>
            <div className="field-group">
              <label className="field-label">Sort order</label>
              <input
                type="number"
                className="settings-input"
                value={currentItem.sortOrder ?? 0}
                onChange={(e) => setCurrentItem({ ...currentItem, sortOrder: e.target.value })}
                placeholder="0"
              />
            </div>
          </>
        );
      case 'news':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title *</label>
              <input
                type="text"
                className="settings-input"
                required
                value={currentItem.title || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Excerpt / body *</label>
              <textarea
                className="settings-input"
                required
                rows={4}
                value={currentItem.excerpt || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, excerpt: e.target.value })}
                placeholder="Short update text shown on the home page…"
              />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Type *</label>
                <select
                  className="settings-input"
                  required
                  value={currentItem.category || 'news'}
                  onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
                >
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Date *</label>
                <input
                  type="text"
                  className="settings-input"
                  required
                  value={currentItem.date || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, date: e.target.value })}
                  placeholder="March 2026"
                />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Cover image</label>
              <div className="landing-upload-row">
                <input
                  type="text"
                  className="settings-input"
                  value={currentItem.imageUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, imageUrl: e.target.value })}
                  placeholder="/uploads/… or /images/…"
                />
                <label className="landing-upload-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImage(f, 'imageUrl');
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
              {currentItem.imageUrl && (
                <img
                  className="landing-preview landing-preview--wide"
                  src={getImageUrl(currentItem.imageUrl)}
                  alt="Update preview"
                />
              )}
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Link URL</label>
                <input
                  type="text"
                  className="settings-input"
                  value={currentItem.linkUrl || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, linkUrl: e.target.value })}
                  placeholder="https://… or /careers"
                />
              </div>
              <div className="field-group">
                <label className="field-label">Sort order</label>
                <input
                  type="number"
                  className="settings-input"
                  value={currentItem.sortOrder ?? 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, sortOrder: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="settings-section landing-content">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Landing Page Content</h2>
        <p className="settings-section-desc">
          Manage dynamic sections shown on the public landing page. Changes appear after you save.
        </p>
      </div>

      <div className="landing-tabs" role="tablist">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={activeSection === section.id}
            className={`landing-tab${activeSection === section.id ? ' is-active' : ''}`}
            onClick={() => {
              setActiveSection(section.id);
              setIsEditing(false);
              setError('');
              setMessage('');
            }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {(error || message) && (
        <p className={`landing-alert${error ? ' is-error' : ''}`}>{error || message}</p>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="settings-card">
          <div>
            <h3 className="settings-card-title">{currentItem.id ? 'Edit item' : 'Add new item'}</h3>
            <p className="settings-card-desc">{sectionMeta.hint}</p>
          </div>
          <div className="settings-fields">{renderFormFields()}</div>
          <div className="settings-actions">
            <button type="submit" className="settings-save-btn" disabled={saving || uploading}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              className="settings-cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setCurrentItem({});
                setError('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="settings-card">
          <div className="landing-card-head">
            <div>
              <h3 className="settings-card-title">{sectionMeta.label}</h3>
              <p className="settings-card-desc">{sectionMeta.hint}</p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ color: '#000', padding: '0.55rem 1rem', fontSize: '0.88rem' }}
              onClick={() => {
                setCurrentItem({});
                setIsEditing(true);
                setError('');
                setMessage('');
              }}
            >
              + Add new
            </button>
          </div>

          {isLoading ? (
            <p className="landing-empty">Loading…</p>
          ) : data.length === 0 ? (
            <div className="landing-empty-box">
              <strong>No items yet</strong>
              <p>Add your first {sectionMeta.label.toLowerCase()} item to show it on the public site.</p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ color: '#000', marginTop: '0.75rem' }}
                onClick={() => {
                  setCurrentItem({});
                  setIsEditing(true);
                }}
              >
                + Add new
              </button>
            </div>
          ) : (
            <ul className="landing-item-list">
              {data.map((item) => (
                <li key={item.id} className="landing-item">
                  <div className="landing-item-main">
                    {(activeSection === 'partners' && item.logoUrl) ||
                    (activeSection === 'team' && item.imageUrl) ||
                    (activeSection === 'hero' && item.imageUrl) ||
                    (activeSection === 'services' && item.heroImage) ||
                    (activeSection === 'awards' && item.imageUrl) ||
                    (activeSection === 'news' && item.imageUrl) ||
                    (activeSection === 'facilities' && item.imageUrl) ? (
                      <img
                        className="landing-item-thumb"
                        src={getImageUrl(
                          activeSection === 'partners'
                            ? item.logoUrl
                            : activeSection === 'services'
                              ? item.heroImage
                              : item.imageUrl
                        )}
                        alt=""
                      />
                    ) : (
                      <span className="landing-item-icon">
                        {item.icon ||
                          item.indexLabel ||
                          item.name?.[0] ||
                          item.title?.[0] ||
                          item.title1?.[0] ||
                          '•'}
                      </span>
                    )}
                    <div>
                      <strong>{itemLabel(item)}</strong>
                      {itemSubtitle(activeSection, item) && <p>{itemSubtitle(activeSection, item)}</p>}
                    </div>
                  </div>
                  <div className="landing-item-actions">
                    <button
                      type="button"
                      className="landing-action"
                      onClick={() => {
                        setCurrentItem(prepareItemForEdit(activeSection, item));
                        setIsEditing(true);
                        setError('');
                        setMessage('');
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="landing-action is-danger" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
