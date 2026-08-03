import { useState, useEffect } from 'react';
import { landingApi } from './api';

export default function AdminLandingSettings() {
  const [activeSection, setActiveSection] = useState('partners');
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>({});
  
  const sections = [
    { id: 'partners', label: 'Partners' },
    { id: 'safety', label: 'Safety & Sustainability' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'team', label: 'Leadership Team' },
    { id: 'awards', label: 'Awards' },
    { id: 'news', label: 'News' }
  ];

  const fetchSectionData = async (sectionId: string) => {
    setIsLoading(true);
    try {
      const res = await landingApi.getSection(sectionId);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectionData(activeSection);
  }, [activeSection]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentItem.id) {
        await landingApi.updateItem(activeSection, currentItem.id, currentItem);
      } else {
        await landingApi.createItem(activeSection, currentItem);
      }
      setIsEditing(false);
      setCurrentItem({});
      fetchSectionData(activeSection);
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await landingApi.deleteItem(activeSection, id);
      fetchSectionData(activeSection);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const renderFormFields = () => {
    switch (activeSection) {
      case 'partners':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Partner Name</label>
              <input type="text" className="settings-input" required value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Logo URL</label>
              <input type="text" className="settings-input" value={currentItem.logoUrl || ''} onChange={e => setCurrentItem({...currentItem, logoUrl: e.target.value})} />
            </div>
          </>
        );
      case 'safety':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title</label>
              <input type="text" className="settings-input" required value={currentItem.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Description</label>
              <textarea className="settings-input" required value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Icon (Emoji or text)</label>
              <input type="text" className="settings-input" value={currentItem.icon || ''} onChange={e => setCurrentItem({...currentItem, icon: e.target.value})} />
            </div>
          </>
        );
      case 'testimonials':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Quote Text</label>
              <textarea className="settings-input" required value={currentItem.text || ''} onChange={e => setCurrentItem({...currentItem, text: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Author Name</label>
              <input type="text" className="settings-input" required value={currentItem.authorName || ''} onChange={e => setCurrentItem({...currentItem, authorName: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Author Title</label>
              <input type="text" className="settings-input" required value={currentItem.authorTitle || ''} onChange={e => setCurrentItem({...currentItem, authorTitle: e.target.value})} />
            </div>
          </>
        );
      case 'team':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Name</label>
              <input type="text" className="settings-input" required value={currentItem.name || ''} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Position</label>
              <input type="text" className="settings-input" required value={currentItem.position || ''} onChange={e => setCurrentItem({...currentItem, position: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Image URL</label>
              <input type="text" className="settings-input" required value={currentItem.imageUrl || ''} onChange={e => setCurrentItem({...currentItem, imageUrl: e.target.value})} />
            </div>
          </>
        );
      case 'awards':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title</label>
              <input type="text" className="settings-input" required value={currentItem.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Description</label>
              <input type="text" className="settings-input" required value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Icon</label>
              <input type="text" className="settings-input" required value={currentItem.icon || ''} onChange={e => setCurrentItem({...currentItem, icon: e.target.value})} />
            </div>
          </>
        );
      case 'news':
        return (
          <>
            <div className="field-group">
              <label className="field-label">Title</label>
              <input type="text" className="settings-input" required value={currentItem.title || ''} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Excerpt</label>
              <textarea className="settings-input" required value={currentItem.excerpt || ''} onChange={e => setCurrentItem({...currentItem, excerpt: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Date String</label>
              <input type="text" className="settings-input" required value={currentItem.date || ''} onChange={e => setCurrentItem({...currentItem, date: e.target.value})} />
            </div>
            <div className="field-group">
              <label className="field-label">Link URL</label>
              <input type="text" className="settings-input" value={currentItem.linkUrl || ''} onChange={e => setCurrentItem({...currentItem, linkUrl: e.target.value})} />
            </div>
          </>
        );
      default: return null;
    }
  };

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Landing Page Content</h2>
        <p className="settings-section-desc">Manage dynamic sections shown on the public landing page.</p>
      </div>
      
      <div className="filter-container" style={{ marginBottom: '2rem' }}>
        {sections.map(section => (
          <button
            key={section.id}
            className={`filter-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => { setActiveSection(section.id); setIsEditing(false); }}
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            {section.label}
          </button>
        ))}
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="settings-card">
          <h3 className="settings-card-title">{currentItem.id ? 'Edit Item' : 'Add New Item'}</h3>
          <div className="settings-fields">
            {renderFormFields()}
          </div>
          <div className="settings-actions" style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="settings-save-btn">Save</button>
            <button type="button" className="settings-cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="settings-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="settings-card-title" style={{ marginBottom: 0 }}>{sections.find(s => s.id === activeSection)?.label} Items</h3>
            <button className="btn btn-primary" onClick={() => { setCurrentItem({}); setIsEditing(true); }} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Add New</button>
          </div>
          
          {isLoading ? (
            <p>Loading...</p>
          ) : data.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items found.</p>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title / Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(item => (
                    <tr key={item.id}>
                      <td>{item.name || item.title || item.authorName || item.text?.substring(0,20) + '...'}</td>
                      <td>
                        <button className="btn" onClick={() => { setCurrentItem(item); setIsEditing(true); }} style={{ marginRight: '0.5rem', background: 'var(--bg-offset)', color: 'var(--text-main)' }}>Edit</button>
                        <button className="btn" onClick={() => handleDelete(item.id)} style={{ background: '#FEE2E2', color: '#EF4444' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
