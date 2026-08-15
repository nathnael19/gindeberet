import { useEffect, useRef, useState } from 'react';
import PublicShell from './PublicShell';
import { settingsApi, contactApi } from './api';
import {
  OFFICE,
  STADIUM_DIRECTIONS_URL,
  directionsToOfficeUrl,
  officeMapEmbedUrl,
  officePlaceUrl,
} from './contactLocation';
import { useI18n } from './i18n/I18nContext';
import './AboutPage.css';
import './ContactPage.css';
import './App.css';

interface ContactPageProps {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const DEFAULT_SETTINGS = {
  officeLocation: OFFICE.address,
  phone: '+251 11 000 0000',
  workingHours: 'Mon–Fri, 8:00am–6:00pm',
  email: 'info@gindeberet.com',
  mapUrl: officePlaceUrl(),
};

const getLineBreakText = (value: string | null | undefined) => {
  const text = (value || '').trim();
  if (!text) return null;
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));
};

export default function ContactPage({ isDarkTheme, toggleTheme }: ContactPageProps) {
  const { t, dict } = useI18n();
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [projectType, setProjectType] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [geoError, setGeoError] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const PROJECT_OPTIONS = [
    { value: 'roads', label: dict.projectTypes.roads },
    { value: 'building', label: dict.projectTypes.building },
    { value: 'water', label: dict.projectTypes.water },
    { value: 'electro', label: dict.projectTypes.electro },
    { value: 'machinery', label: dict.projectTypes.machinery },
    { value: 'corridors', label: dict.projectTypes.corridors },
    { value: 'other', label: dict.projectTypes.other },
  ];

  useEffect(() => {
    settingsApi
      .getSite()
      .then((response) => {
        if (response.success && response.data) {
          setSiteSettings({
            officeLocation: response.data.officeLocation || DEFAULT_SETTINGS.officeLocation,
            phone: response.data.phone || DEFAULT_SETTINGS.phone,
            workingHours: response.data.workingHours || DEFAULT_SETTINGS.workingHours,
            email: response.data.email || DEFAULT_SETTINGS.email,
            mapUrl: response.data.mapUrl || DEFAULT_SETTINGS.mapUrl,
          });
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openStadiumDirections = () => {
    window.open(STADIUM_DIRECTIONS_URL, '_blank', 'noopener,noreferrer');
  };

  const openFromMyLocation = () => {
    setGeoError(false);
    setGeoStatus(t('contact.locating'));

    if (!navigator.geolocation) {
      setGeoError(true);
      setGeoStatus(t('contact.geoUnsupported'));
      window.open(directionsToOfficeUrl(), '_blank', 'noopener,noreferrer');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus(t('contact.openingDirs'));
        const url = directionsToOfficeUrl({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => setGeoStatus(''), 2000);
      },
      () => {
        setGeoError(true);
        setGeoStatus(t('contact.geoDenied'));
        window.open(directionsToOfficeUrl(), '_blank', 'noopener,noreferrer');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  return (
    <PublicShell active="contact" isDarkTheme={isDarkTheme} toggleTheme={toggleTheme}>
      <div className="contact-page">
        <header className="page-hero">
          <div className="page-hero-bg" />
          <div className="container page-hero-inner">
            <span className="page-kicker">{t('contact.kicker')}</span>
            <h1>{t('contact.heroTitle')}</h1>
            <p>{t('contact.heroSubtitle')}</p>
          </div>
        </header>

        <section className="contact-page-body">
          <div className="container contact-page-grid">
            <div className="reveal-up">
              <h2 className="section-title">{t('contact.getInTouch')}</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {t('contact.getInTouchSub')}
              </p>

              <div className="cp-info-list">
                <div className="cp-info-item">
                  <div className="cp-info-icon">📍</div>
                  <div>
                    <h4>{t('contact.office')}</h4>
                    <p>{getLineBreakText(siteSettings.officeLocation)}</p>
                  </div>
                </div>
                <div className="cp-info-item">
                  <div className="cp-info-icon">📞</div>
                  <div>
                    <h4>{t('contact.phone')}</h4>
                    <p>
                      <a href={`tel:${(siteSettings.phone || '').replace(/\s/g, '')}`}>
                        {getLineBreakText(siteSettings.phone)}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="cp-info-item">
                  <div className="cp-info-icon">✉️</div>
                  <div>
                    <h4>{t('contact.email')}</h4>
                    <p>
                      <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
                    </p>
                  </div>
                </div>
                <div className="cp-info-item">
                  <div className="cp-info-icon">🕐</div>
                  <div>
                    <h4>{t('contact.hours')}</h4>
                    <p>{getLineBreakText(siteSettings.workingHours)}</p>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
                {t('contact.directions')}
              </h3>
              <div className="cp-directions">
                <button type="button" className="cp-dir-btn" onClick={openStadiumDirections}>
                  <span>
                    {t('contact.fromStadium')}
                    <small>{t('contact.fromStadiumSub')}</small>
                  </span>
                  <span aria-hidden>→</span>
                </button>
                <button type="button" className="cp-dir-btn" onClick={openFromMyLocation}>
                  <span>
                    {t('contact.fromMyLocation')}
                    <small>{t('contact.fromMyLocationSub')}</small>
                  </span>
                  <span aria-hidden>→</span>
                </button>
              </div>
              <p className={`cp-dir-status ${geoError ? 'error' : ''}`}>{geoStatus}</p>
            </div>

            <div className="cp-form-card reveal-up" style={{ transitionDelay: '0.1s' }}>
              <h3>{t('contact.formTitle')}</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError('');
                  setFormSuccess('');
                  if (!projectType) {
                    setFormError(t('contact.selectOption'));
                    return;
                  }
                  setIsSubmitting(true);
                  try {
                    await contactApi.send({
                      firstName: firstName.trim(),
                      lastName: lastName.trim(),
                      email: email.trim(),
                      projectType,
                      message: message.trim(),
                    });
                    setFormSuccess(t('contact.thanks'));
                    setFirstName('');
                    setLastName('');
                    setEmail('');
                    setProjectType('');
                    setMessage('');
                  } catch (err) {
                    setFormError(
                      err instanceof Error ? err.message : 'Could not send your message'
                    );
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div className="cp-form-row">
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.firstName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.lastName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.email')}</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem', position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.projectType')}</label>
                  <div className="custom-dropdown" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    <div className={`form-control dropdown-selected ${!projectType ? 'placeholder' : ''}`}>
                      {projectType ? PROJECT_OPTIONS.find((o) => o.value === projectType)?.label : t('contact.selectOption')}
                      <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                    </div>
                    {isDropdownOpen && (
                      <div className="dropdown-menu">
                        {PROJECT_OPTIONS.map((option) => (
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
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('contact.message')}</label>
                  <textarea
                    className="form-control"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('contact.messagePlaceholder')}
                    style={{ width: '100%', minHeight: '130px', resize: 'vertical' }}
                  />
                </div>

                {formError && (
                  <p style={{ color: '#b91c1c', marginBottom: '1rem', fontWeight: 600 }}>{formError}</p>
                )}
                {formSuccess && (
                  <p style={{ color: '#15803d', marginBottom: '1rem', fontWeight: 600 }}>{formSuccess}</p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ color: '#000', fontWeight: 700, width: '100%' }}
                >
                  {isSubmitting ? '…' : t('common.sendMessage')}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="cp-map-section">
          <div className="container">
            <div className="cp-map-head reveal-up">
              <div>
                <h2 className="section-title">{t('contact.mapTitle')}</h2>
                <p className="section-subtitle" style={{ marginBottom: 0 }}>
                  {OFFICE.placeLabel}
                </p>
              </div>
            </div>

            <div className="cp-map-frame reveal-up">
              <iframe
                title="Gindeberet office location map"
                src={officeMapEmbedUrl()}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <div className="cp-map-actions reveal-up">
              <a
                className="btn btn-primary"
                style={{ color: '#000' }}
                href={siteSettings.mapUrl || officePlaceUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('common.openMaps')}
              </a>
              <button type="button" className="btn btn-outline" onClick={openStadiumDirections}>
                {t('contact.dirStadiumBtn')}
              </button>
              <button type="button" className="btn btn-outline" onClick={openFromMyLocation}>
                {t('contact.dirMyLocBtn')}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
