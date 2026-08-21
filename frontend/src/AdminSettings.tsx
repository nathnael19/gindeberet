import { useState, useRef, useEffect } from 'react';
import { authApi, settingsApi } from './api';
import AdminLayout from './AdminLayout';
import AdminLandingSettings from './AdminLandingSettings';
import './AdminSettings.css';

const ADMIN_SETTINGS_STORAGE_KEY = 'gindeberet:admin-settings';

const DEFAULT_SITE_SETTINGS = {
  officeLocation: '123 Industrial Way, Builder City, BC 12345',
  phone: '(555) 123-4567',
  workingHours: 'Mon-Fri, 8am-6pm',
  email: 'gindeberetconstruction278@gmail.com',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=9.0244,38.7469'
};

type PersistedAdminSettings = {
  phone?: string;
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
  const [activeTab, setActiveTab] = useState<'profile' | 'website' | 'content'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = window.localStorage.getItem('gindeberet:admin-settings-tab');
      if (savedTab === 'profile' || savedTab === 'website' || savedTab === 'content') {
        return savedTab as 'profile' | 'website' | 'content';
      }
    }
    return 'profile';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('gindeberet:admin-settings-tab', activeTab);
    }
  }, [activeTab]);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Website contact info state (shown on the public landing page)
  const [siteOfficeLocation, setSiteOfficeLocation] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteWorkingHours, setSiteWorkingHours] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
  const [siteMapUrl, setSiteMapUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geoPrecision, setGeoPrecision] = useState<string | null>(null);
  const geoWatchRef = useRef<number | null>(null);

  const [hasChanges, setHasChanges] = useState(false);
  const initialValues = useRef({
    fullName, email, phone,
    currentPassword, newPassword, confirmPassword
  });

  const [hasSiteChanges, setHasSiteChanges] = useState(false);
  const initialSiteValues = useRef({
    officeLocation: '',
    phone: '',
    workingHours: '',
    email: '',
    mapUrl: ''
  });

  const applyUserData = (userData: any) => {
    const persistedSettings = readPersistedAdminSettings();
    const nextFullName = userData.name || userData.fullName || [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim();
    const nextEmail = userData.email || '';
    const nextPhone = persistedSettings.phone ?? '';

    setFullName(nextFullName);
    setEmail(nextEmail);
    setPhone(nextPhone);

    initialValues.current = {
      fullName: nextFullName,
      email: nextEmail,
      phone: nextPhone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  };

  const applySiteSettings = (siteData: any) => {
    const nextOfficeLocation = siteData.officeLocation || DEFAULT_SITE_SETTINGS.officeLocation;
    const nextPhone = siteData.phone || DEFAULT_SITE_SETTINGS.phone;
    const nextWorkingHours = siteData.workingHours || DEFAULT_SITE_SETTINGS.workingHours;
    const nextEmail = siteData.email || DEFAULT_SITE_SETTINGS.email;
    const nextMapUrl = siteData.mapUrl || DEFAULT_SITE_SETTINGS.mapUrl;

    setSiteOfficeLocation(nextOfficeLocation);
    setSitePhone(nextPhone);
    setSiteWorkingHours(nextWorkingHours);
    setSiteEmail(nextEmail);
    setSiteMapUrl(nextMapUrl);

    initialSiteValues.current = {
      officeLocation: nextOfficeLocation,
      phone: nextPhone,
      workingHours: nextWorkingHours,
      email: nextEmail,
      mapUrl: nextMapUrl
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

  // Fetch website contact info on mount
  useEffect(() => {
    let isActive = true;

    const fetchSiteSettings = async () => {
      try {
        const response = await settingsApi.getSiteCached((freshResponse) => {
          if (isActive && freshResponse.success && freshResponse.data) {
            applySiteSettings(freshResponse.data);
          }
        });

        if (isActive && response.success && response.data) {
          applySiteSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    };

    fetchSiteSettings();

    return () => {
      isActive = false;
    };
  }, []);

  // Stop any in-flight geolocation watch when the component unmounts
  useEffect(() => {
    return () => {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const isDirty = 
      fullName !== initialValues.current.fullName ||
      email !== initialValues.current.email ||
      phone !== initialValues.current.phone ||
      currentPassword !== initialValues.current.currentPassword ||
      newPassword !== initialValues.current.newPassword ||
      confirmPassword !== initialValues.current.confirmPassword;
      
    setHasChanges(isDirty);
  }, [fullName, email, phone, currentPassword, newPassword, confirmPassword]);

  const handleCancel = () => {
    const init = initialValues.current;
    setFullName(init.fullName);
    setEmail(init.email);
    setPhone(init.phone);
    setCurrentPassword(init.currentPassword);
    setNewPassword(init.newPassword);
    setConfirmPassword(init.confirmPassword);
    setHasChanges(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword && !currentPassword) {
      setError('Current password is required to set a new password');
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    try {
      const response = await authApi.updateMe({
        firstName,
        lastName,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (response.success) {
        writePersistedAdminSettings({
          phone,
        });

        applyUserData(response.data || {
          name: fullName,
          email,
          phone,
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
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      setSaved(false);
    }
  };

  useEffect(() => {
    const isDirty =
      siteOfficeLocation !== initialSiteValues.current.officeLocation ||
      sitePhone !== initialSiteValues.current.phone ||
      siteWorkingHours !== initialSiteValues.current.workingHours ||
      siteEmail !== initialSiteValues.current.email ||
      siteMapUrl !== initialSiteValues.current.mapUrl;

    setHasSiteChanges(isDirty);
  }, [siteOfficeLocation, sitePhone, siteWorkingHours, siteEmail, siteMapUrl]);

  const handleSiteCancel = () => {
    const init = initialSiteValues.current;
    setSiteOfficeLocation(init.officeLocation);
    setSitePhone(init.phone);
    setSiteWorkingHours(init.workingHours);
    setSiteEmail(init.email);
    setSiteMapUrl(init.mapUrl);
    setHasSiteChanges(false);
    setGeoError('');
  };

  const handleUseMyLocation = () => {
    setGeoError('');
    setGeoPrecision(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);

    let bestPosition: GeolocationPosition | null = null;
    let finished = false;

    const stop = () => {
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
      setIsLocating(false);
    };

    const finish = (position: GeolocationPosition) => {
      if (finished) return;
      finished = true;
      stop();

      const { latitude, longitude, accuracy } = position.coords;
      setSiteMapUrl(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);

      const roundedAccuracy = Math.round(accuracy);
      if (accuracy <= 100) {
        setGeoPrecision(`Location precision: ±${roundedAccuracy} m`);
      } else if (accuracy <= 1000) {
        setGeoError(`Approximate location (±${roundedAccuracy} m) — the pin may be off by a few blocks or streets. For a precise fix, use a GPS-enabled device and grant precise location permission.`);
      } else {
        setGeoError(`Very coarse location (±${roundedAccuracy} m). This means your browser only had IP-based data — common when on a VPN, wired Ethernet, or without WiFi positioning — so the pin can be far from your actual spot. Try again on a mobile device with GPS (over HTTPS), disable VPN, or paste the correct Google Maps link manually.`);
      }
    };

    const onError = (error: GeolocationPositionError) => {
      if (finished) return;
      finished = true;
      stop();

      if (error.code === error.PERMISSION_DENIED) {
        setGeoError('Location access was denied. Please allow precise location permission and try again.');
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setGeoError('Your current location could not be determined.');
      } else if (error.code === error.TIMEOUT) {
        setGeoError('Timed out while trying to get your location.');
      } else {
        setGeoError('Unable to get your current location.');
      }
    };

    const onFix = (position: GeolocationPosition) => {
      if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = position;
      }
      // Stop early once the fix is precise enough
      if (position.coords.accuracy <= 20) {
        finish(bestPosition);
      }
    };

    geoWatchRef.current = navigator.geolocation.watchPosition(
      onFix,
      onError,
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Fallback: stop refining after a few seconds and use the best fix received
    window.setTimeout(() => {
      if (finished) return;
      if (bestPosition) {
        finish(bestPosition);
      } else {
        finished = true;
        stop();
        setGeoError('Unable to get a location fix. Try again, or make sure precise location permission is granted.');
      }
    }, 8000);
  };

  const handleSiteSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await settingsApi.updateSite({
        officeLocation: siteOfficeLocation.trim(),
        phone: sitePhone.trim(),
        workingHours: siteWorkingHours.trim(),
        email: siteEmail.trim(),
        mapUrl: siteMapUrl.trim(),
      });

      if (response.success) {
        applySiteSettings(response.data || {
          officeLocation: siteOfficeLocation,
          phone: sitePhone,
          workingHours: siteWorkingHours,
          email: siteEmail,
          mapUrl: siteMapUrl,
        });
        setHasSiteChanges(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
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
      key: 'website' as const,
      label: 'Website',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
    },
    {
      key: 'content' as const,
      label: 'Landing Content',
      icon: (
        <svg className="settings-tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
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

            {/* ── Profile & Security ── */}
            {activeTab === 'profile' && (
              <form className="settings-section" onSubmit={handleSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Profile & Security</h2>
                  <p className="settings-section-desc">Update your personal details and keep your account safe with a strong password.</p>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Profile Information</h3>
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
                        <label className="field-label">Email Address</label>
                        <input
                          type="email"
                          className="settings-input"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          id="settings-email"
                        />
                      </div>
                    </div>

                    <div className="field-row">
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
                  </div>
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
                        autoComplete="new-password"
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
                          autoComplete="new-password"
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
                          autoComplete="new-password"
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

                <div className="settings-card danger-zone">
                  <h3 className="settings-card-title" style={{ color: '#EF4444' }}>Danger Zone</h3>
                  <p className="settings-card-desc">Permanently delete your admin account. This action cannot be undone.</p>
                  <button type="button" className="danger-btn">Delete Account</button>
                </div>

                {error && <div className="settings-field-error" style={{ marginBottom: '1rem', color: '#EF4444' }}>{error}</div>}

                {hasChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

            {/* ── Website ── */}
            {activeTab === 'website' && (
              <form className="settings-section" onSubmit={handleSiteSave}>
                <div className="settings-section-header">
                  <h2 className="settings-section-title">Website Contact Info</h2>
                  <p className="settings-section-desc">Update the office location, phone, and email shown in the contact section of the public website.</p>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Contact Details</h3>
                  <div className="settings-fields">
                    <div className="field-group">
                      <label className="field-label">Office Location</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="123 Industrial Way, Builder City, BC 12345"
                        value={siteOfficeLocation}
                        onChange={e => setSiteOfficeLocation(e.target.value)}
                        id="settings-site-office-location"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Phone</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="(555) 123-4567"
                        value={sitePhone}
                        onChange={e => setSitePhone(e.target.value)}
                        id="settings-site-phone"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Working Hours</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="Mon-Fri, 8am-6pm"
                        value={siteWorkingHours}
                        onChange={e => setSiteWorkingHours(e.target.value)}
                        id="settings-site-working-hours"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Email</label>
                      <input
                        type="text"
                        className="settings-input"
                        placeholder="gindeberetconstruction278@gmail.com"
                        value={siteEmail}
                        onChange={e => setSiteEmail(e.target.value)}
                        id="settings-site-email"
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Map Location</label>
                      <div className="map-locator-row">
                        <input
                          type="url"
                          className="settings-input"
                          placeholder="https://www.google.com/maps/search/?api=1&query=..."
                          value={siteMapUrl}
                          onChange={e => setSiteMapUrl(e.target.value)}
                          id="settings-site-map-url"
                        />
                        <button
                          type="button"
                          className="settings-locate-btn"
                          onClick={handleUseMyLocation}
                          disabled={isLocating}
                          id="settings-locate-btn"
                        >
                          {isLocating ? 'Locating...' : 'Use my current location'}
                        </button>
                      </div>
                      {geoPrecision && <p className="settings-locate-note">{geoPrecision}</p>}
                      {geoError && <p className="settings-field-error">{geoError}</p>}
                      <p className="settings-card-desc" style={{ marginTop: '0.5rem' }}>Click "Use my current location" to set the link to your current location, or paste a Google Maps link manually. Visitors will open it on the Google Maps website or app. Leave empty to hide the map link. Location precision depends on your device — GPS on mobile, WiFi/IP on desktop — and requires HTTPS (or localhost).</p>
                    </div>
                  </div>
                </div>

                {hasSiteChanges && (
                  <div className="settings-actions">
                    <button type="submit" className="settings-save-btn">Save Changes</button>
                    <button type="button" className="settings-cancel-btn" onClick={handleSiteCancel}>Cancel</button>
                  </div>
                )}
              </form>
            )}

            {/* ── Landing Page Content ── */}
            {activeTab === 'content' && (
              <AdminLandingSettings />
            )}

              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
