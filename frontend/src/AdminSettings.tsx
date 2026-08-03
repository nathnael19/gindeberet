import { useState, useRef, useEffect } from 'react';
import { authApi } from './api';
import AdminLayout from './AdminLayout';
import './AdminSettings.css';

const ADMIN_SETTINGS_STORAGE_KEY = 'gindeberet:admin-settings';

type PersistedAdminSettings = {
  phone?: string;
  bio?: string;
  twoFactor?: boolean;
  emailNotifs?: boolean;
  projectUpdates?: boolean;
  teamAlerts?: boolean;
  weeklyReport?: boolean;
  securityAlerts?: boolean;
  language?: string;
  timezone?: string;
  dateFormat?: string;
  density?: 'comfortable' | 'compact';
};

const readPersistedAdminSettings = (): PersistedAdminSettings => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return parsedValue as PersistedAdminSettings;
  } catch {
    return {};
  }
};

const writePersistedAdminSettings = (settings: PersistedAdminSettings) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota or privacy errors.
  }
};

export default function AdminSettings({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance'>('profile');
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);

  // Notifications state
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [teamAlerts, setTeamAlerts] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Appearance state
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/Toronto');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  const [hasChanges, setHasChanges] = useState(false);
  const initialValues = useRef({
    fullName, email, phone, role, bio,
    currentPassword, newPassword, confirmPassword, twoFactor,
    emailNotifs, projectUpdates, teamAlerts, weeklyReport, securityAlerts,
    language, timezone, dateFormat, density
  });

  const applyUserData = (userData: any) => {
    const persistedSettings = readPersistedAdminSettings();
    const nextFullName = userData.name || userData.fullName || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim();
    const nextEmail = userData.email || '';
    const nextPhone = persistedSettings.phone ?? '';
    const nextRole = userData.role || '';
    const nextBio = persistedSettings.bio ?? '';
    const nextTwoFactor = persistedSettings.twoFactor ?? false;
    const nextEmailNotifs = persistedSettings.emailNotifs ?? true;
    const nextProjectUpdates = persistedSettings.projectUpdates ?? true;
    const nextTeamAlerts = persistedSettings.teamAlerts ?? false;
    const nextWeeklyReport = persistedSettings.weeklyReport ?? true;
    const nextSecurityAlerts = persistedSettings.securityAlerts ?? true;
    const nextLanguage = persistedSettings.language || 'en';
    const nextTimezone = persistedSettings.timezone || 'America/Toronto';
    const nextDateFormat = persistedSettings.dateFormat || 'MM/DD/YYYY';
    const nextDensity = persistedSettings.density || 'comfortable';

    setFullName(nextFullName);
    setEmail(nextEmail);
    setPhone(nextPhone);
    setRole(nextRole);
    setBio(nextBio);
    setTwoFactor(nextTwoFactor);
    setEmailNotifs(nextEmailNotifs);
    setProjectUpdates(nextProjectUpdates);
    setTeamAlerts(nextTeamAlerts);
    setWeeklyReport(nextWeeklyReport);
    setSecurityAlerts(nextSecurityAlerts);
    setLanguage(nextLanguage);
    setTimezone(nextTimezone);
    setDateFormat(nextDateFormat);
    setDensity(nextDensity);

    initialValues.current = {
      fullName: nextFullName,
      email: nextEmail,
      phone: nextPhone,
      role: nextRole,
      bio: nextBio,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactor: nextTwoFactor,
      emailNotifs: nextEmailNotifs,
      projectUpdates: nextProjectUpdates,
      teamAlerts: nextTeamAlerts,
      weeklyReport: nextWeeklyReport,
      securityAlerts: nextSecurityAlerts,
      language: nextLanguage,
      timezone: nextTimezone,
      dateFormat: nextDateFormat,
      density: nextDensity,
    };
  };

  // Fetch user data on component mount
  useEffect(() => {
    let isActive = true;

    const fetchUserData = async () => {
      try {
        const response = await authApi.getMeCached((freshResponse) => {
          if (isActive && freshResponse.success && freshResponse.data) {
            applyUserData(freshResponse.data);
          }
        });

        if (isActive && response.success && response.data) {
          applyUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const isDirty = 
      fullName !== initialValues.current.fullName ||
      email !== initialValues.current.email ||
      phone !== initialValues.current.phone ||
      role !== initialValues.current.role ||
      bio !== initialValues.current.bio ||
      currentPassword !== initialValues.current.currentPassword ||
      newPassword !== initialValues.current.newPassword ||
      confirmPassword !== initialValues.current.confirmPassword ||
      twoFactor !== initialValues.current.twoFactor ||
      emailNotifs !== initialValues.current.emailNotifs ||
      projectUpdates !== initialValues.current.projectUpdates ||
      teamAlerts !== initialValues.current.teamAlerts ||
      weeklyReport !== initialValues.current.weeklyReport ||
      securityAlerts !== initialValues.current.securityAlerts ||
      language !== initialValues.current.language ||
      timezone !== initialValues.current.timezone ||
      dateFormat !== initialValues.current.dateFormat ||
      density !== initialValues.current.density;
      
    setHasChanges(isDirty);
  }, [fullName, email, phone, role, bio, currentPassword, newPassword, confirmPassword, twoFactor, emailNotifs, projectUpdates, teamAlerts, weeklyReport, securityAlerts, language, timezone, dateFormat, density]);

  const handleCancel = () => {
    const init = initialValues.current;
    setFullName(init.fullName);
    setEmail(init.email);
    setPhone(init.phone);
    setRole(init.role);
    setBio(init.bio);
    setCurrentPassword(init.currentPassword);
    setNewPassword(init.newPassword);
    setConfirmPassword(init.confirmPassword);
    setTwoFactor(init.twoFactor);
    setEmailNotifs(init.emailNotifs);
    setProjectUpdates(init.projectUpdates);
    setTeamAlerts(init.teamAlerts);
    setWeeklyReport(init.weeklyReport);
    setSecurityAlerts(init.securityAlerts);
    setLanguage(init.language);
    setTimezone(init.timezone);
    setDateFormat(init.dateFormat);
    setDensity(init.density);
    setHasChanges(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const response = await authApi.updateMe({
        firstName,
        lastName,
        email,
        role,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (response.success) {
        writePersistedAdminSettings({
          phone,
          bio,
          twoFactor,
          emailNotifs,
          projectUpdates,
          teamAlerts,
          weeklyReport,
          securityAlerts,
          language,
          timezone,
          dateFormat,
          density,
        });

        applyUserData(response.data || {
          name: fullName,
          email,
          phone,
          role,
          bio,
        });
        setHasChanges(false);
        setSaved(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        window.dispatchEvent(new CustomEvent('admin:user-updated', {
          detail: response.data,
        }));
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaved(false);
    }
  };

  const tabs = [
    {
      key: 'profile' as const,
      label: 'Profile',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: 'security' as const,
      label: 'Security',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
    {
      key: 'notifications' as const,
      label: 'Notifications',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      key: 'appearance' as const,
      label: 'Appearance',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="settings">
      <div className="settings-page">
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
            Loading settings...
          </div>
        ) : (
          <>
            <div className="settings-page-header">
              <div>
                <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>Settings</h1>
                <p className="settings-subtitle">Manage your account, security, and preferences</p>
              </div>
              {saved && (
                <div className="settings-saved-toast">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Changes saved!
                </div>
              )}
            </div>

            <div className="settings-layout">
              {/* Tab Sidebar */}
              <nav className="settings-tabs">
                {tabs.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    className={`settings-tab-btn ${activeTab === key ? 'active' : ''}`}
                    onClick={() => setActiveTab(key)}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </nav>

              {/* Content */}
              <div className="settings-content">

            {/* ── Profile ── */}
            {activeTab === 'profile' && (
              <form className="settings-section" onSubmit={handleSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Profile Information</h2>
                  <p className="settings-section-desc">Update your name, email, and personal details.</p>
                </div>

                {/* Avatar row */}
                <div className="avatar-row">
                  <div className="settings-avatar">A</div>
                  <div>
                    <p className="avatar-name">{fullName}</p>
                    <p className="avatar-role">{role}</p>
                    <button type="button" className="avatar-change-btn">Change photo</button>
                  </div>
                </div>

                <div className="settings-fields">
                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label">Full Name</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        id="settings-full-name"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Role</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        id="settings-role"
                      />
                    </div>
                  </div>

                  <div className="field-row">
                    <div className="field-group">
                      <label className="field-label">Email Address</label>
                      <input
                        type="email"
                        className="settings-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        id="settings-email"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Phone Number</label>
                      <input
                        type="tel"
                        className="settings-input"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        id="settings-phone"
                      />
                    </div>
                  </div>

                  <div className="field-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="field-label">Bio</label>
                    <textarea
                      className="settings-input settings-textarea"
                      placeholder="Write a short bio..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      id="settings-bio"
                    />
                  </div>
                </div>

                {hasChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

            {/* ── Security ── */}
            {activeTab === 'security' && (
              <form className="settings-section" onSubmit={handleSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Security</h2>
                  <p className="settings-section-desc">Keep your account safe with a strong password and two-factor authentication.</p>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Change Password</h3>
                  <div className="settings-fields">
                    <div className="field-group">
                      <label className="field-label">Current Password</label>
                      <input
                        type="password"
                        className="settings-input"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        id="settings-current-password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">New Password</label>
                        <input
                          type="password"
                          className="settings-input"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          id="settings-new-password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="field-group">
                        <label className="field-label">Confirm New Password</label>
                        <input
                          type="password"
                          className="settings-input"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          id="settings-confirm-password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="password-strength">
                      <span className="field-label" style={{ marginBottom: 0 }}>Password strength</span>
                      <div className="strength-bars">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`strength-bar ${newPassword.length >= i * 3 ? 'active' : ''} ${newPassword.length >= 12 ? 'strong' : newPassword.length >= 6 ? 'medium' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="strength-label">
                        {newPassword.length === 0 ? 'Enter a password' : newPassword.length < 6 ? 'Too weak' : newPassword.length < 12 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <div className="toggle-row">
                    <div>
                      <h3 className="settings-card-title" style={{ marginBottom: '0.25rem' }}>Two-Factor Authentication</h3>
                      <p className="settings-card-desc">Add an extra layer of security to your account via authenticator app or SMS.</p>
                    </div>
                    <button
                      type="button"
                      className={`toggle-switch ${twoFactor ? 'on' : ''}`}
                      onClick={() => setTwoFactor(!twoFactor)}
                      aria-label="Toggle two-factor authentication"
                      id="settings-2fa-toggle"
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                  {twoFactor && (
                    <div className="two-factor-note">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      2FA is enabled. You'll be asked for a code on each login.
                    </div>
                  )}
                </div>

                <div className="settings-card danger-zone">
                  <h3 className="settings-card-title" style={{ color: '#EF4444' }}>Danger Zone</h3>
                  <p className="settings-card-desc">Permanently delete your admin account. This action cannot be undone.</p>
                  <button type="button" className="danger-btn">Delete Account</button>
                </div>

                {hasChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <form className="settings-section" onSubmit={handleSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Notifications</h2>
                  <p className="settings-section-desc">Choose what you want to be notified about.</p>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Email Notifications</h3>

                  {[
                    {
                      id: 'notif-email',
                      label: 'All email notifications',
                      desc: 'Master toggle for all email alerts',
                      value: emailNotifs,
                      set: setEmailNotifs,
                    },
                    {
                      id: 'notif-projects',
                      label: 'Project updates',
                      desc: 'Status changes, milestones, and timeline updates',
                      value: projectUpdates,
                      set: setProjectUpdates,
                    },
                    {
                      id: 'notif-team',
                      label: 'Team alerts',
                      desc: 'New members, role changes, and departures',
                      value: teamAlerts,
                      set: setTeamAlerts,
                    },
                    {
                      id: 'notif-weekly',
                      label: 'Weekly summary report',
                      desc: 'A digest of all activity sent every Monday',
                      value: weeklyReport,
                      set: setWeeklyReport,
                    },
                    {
                      id: 'notif-security',
                      label: 'Security alerts',
                      desc: 'Login attempts, password changes, and suspicious activity',
                      value: securityAlerts,
                      set: setSecurityAlerts,
                    },
                  ].map(({ id, label, desc, value, set }) => (
                    <div key={id} className="toggle-row notif-row">
                      <div>
                        <p className="notif-label">{label}</p>
                        <p className="notif-desc">{desc}</p>
                      </div>
                      <button
                        type="button"
                        className={`toggle-switch ${value ? 'on' : ''}`}
                        onClick={() => set(!value)}
                        aria-label={`Toggle ${label}`}
                        id={id}
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>

                {hasChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

            {/* ── Appearance ── */}
            {activeTab === 'appearance' && (
              <form className="settings-section" onSubmit={handleSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Appearance & Preferences</h2>
                  <p className="settings-section-desc">Customize how the admin panel looks and feels.</p>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Theme</h3>
                  <div className="theme-options">
                    <button
                      type="button"
                      className={`theme-option ${!isDarkTheme ? 'active' : ''}`}
                      onClick={() => isDarkTheme && toggleTheme()}
                      id="settings-theme-light"
                    >
                      <div className="theme-preview light-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      className={`theme-option ${isDarkTheme ? 'active' : ''}`}
                      onClick={() => !isDarkTheme && toggleTheme()}
                      id="settings-theme-dark"
                    >
                      <div className="theme-preview dark-preview">
                        <div className="preview-sidebar" />
                        <div className="preview-content" />
                      </div>
                      <span>Dark</span>
                    </button>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Display Density</h3>
                  <div className="density-options">
                    {(['comfortable', 'compact'] as const).map(d => (
                      <label key={d} className={`density-option ${density === d ? 'active' : ''}`} htmlFor={`density-${d}`}>
                        <input
                          type="radio"
                          id={`density-${d}`}
                          name="density"
                          value={d}
                          checked={density === d}
                          onChange={() => setDensity(d)}
                          style={{ display: 'none' }}
                        />
                        <div className="density-icon">
                          {d === 'comfortable'
                            ? <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            : <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 8h16M4 11h16M4 14h16M4 17h16M4 20h16" /></svg>
                          }
                        </div>
                        <span style={{ textTransform: 'capitalize' }}>{d}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Regional Settings</h3>
                  <div className="settings-fields">
                    <div className="field-row">
                      <div className="field-group">
                        <label className="field-label">Language</label>
                        <select
                          className="settings-input settings-select"
                          value={language}
                          onChange={e => setLanguage(e.target.value)}
                          id="settings-language"
                        >
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                      <div className="field-group">
                        <label className="field-label">Timezone</label>
                        <select
                          className="settings-input settings-select"
                          value={timezone}
                          onChange={e => setTimezone(e.target.value)}
                          id="settings-timezone"
                        >
                          <option value="America/Toronto">America/Toronto (EST)</option>
                          <option value="America/New_York">America/New_York (ET)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                          <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (EAT)</option>
                        </select>
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label">Date Format</label>
                      <select
                        className="settings-input settings-select"
                        value={dateFormat}
                        onChange={e => setDateFormat(e.target.value)}
                        id="settings-date-format"
                        style={{ maxWidth: '260px' }}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>

                {hasChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
