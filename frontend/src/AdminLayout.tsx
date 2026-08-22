import { type ReactNode, useState, useEffect, useRef } from 'react';
import { authApi } from './api';
import './AdminDashboard.css';

interface AdminLayoutProps {
  children: ReactNode;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  activePage: 'overview' | 'projects' | 'careers' | 'stamp' | 'settings' | 'profile';
}

import { adminNavigate } from './adminNav';

export default function AdminLayout({ children, isDarkTheme, toggleTheme, activePage }: AdminLayoutProps) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('adminSidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev: boolean) => {
      const newState = !prev;
      localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    let isActive = true;

    const fetchUserData = async () => {
      try {
        const response = await authApi.getMeCached((freshResponse) => {
          if (isActive && freshResponse.success && freshResponse.data) {
            setUser({
              name: freshResponse.data.name || freshResponse.data.fullName || 'Admin User',
              role: freshResponse.data.role || 'Admin',
            });
          }
        });

        if (isActive && response.success && response.data) {
          setUser({
            name: response.data.name || response.data.fullName || 'Admin User',
            role: response.data.role || 'Admin',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isActive) {
          setUser({ name: 'Admin User', role: 'Admin' });
        }
      }
    };

    fetchUserData();

    const handleUserUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ name?: string; fullName?: string; role?: string }>;
      const userData = customEvent.detail;
      if (!userData) {
        return;
      }

      setUser({
        name: userData.name || userData.fullName || 'Admin User',
        role: userData.role || 'Admin',
      });
    };

    window.addEventListener('admin:user-updated', handleUserUpdated);

    return () => {
      isActive = false;
      window.removeEventListener('admin:user-updated', handleUserUpdated);
    };
  }, []);

  const HomeIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );

  const ProjectsIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  const CareersIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const StampIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 14h14l-1.5 5H6.5L5 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14V9a4 4 0 018 0v5" />
    </svg>
  );

  const SettingsIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const LogoutIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  const BellIcon = () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );

  const MenuIcon = () => (
    <svg className="nav-icon" style={{ cursor: 'pointer', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const navItems = [
    { key: 'overview' as const, label: 'Overview', path: '/admin', Icon: HomeIcon },
    { key: 'projects' as const, label: 'Projects', path: '/projects', Icon: ProjectsIcon },
    { key: 'profile' as const, label: 'Company Profile', path: '/company-profile-admin', Icon: ProfileIcon },
    { key: 'careers' as const, label: 'Careers', path: '/vacancies', Icon: CareersIcon },
    { key: 'stamp' as const, label: 'Stamp & Sign', path: '/stamp-sign', Icon: StampIcon },
    { key: 'settings' as const, label: 'Settings', path: '/settings', Icon: SettingsIcon },
  ];

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Gindeberet General Construction PLC" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.78rem', lineHeight: 1.2 }}>Gindeberet General Construction PLC</span>
            </div>
          )}
          <button onClick={toggleSidebar} className="icon-btn" aria-label="Toggle Sidebar" style={{ padding: '0.25rem', flexShrink: 0 }}>
            <MenuIcon />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ key, label, path, Icon }) => (
            <a
              key={key}
              href={path}
              className={`nav-item ${activePage === key ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); adminNavigate(path); }}
            >
              <Icon />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            authApi.logout();
            // Force redirect to home page
            window.location.href = '/';
          }}>
            <LogoutIcon />
            {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">

          <div className="header-actions">
            <button onClick={toggleTheme} className="icon-btn theme-toggle" aria-label="Toggle Theme" style={{ fontSize: '1.25rem', padding: '0.25rem' }}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <div className="notification-wrapper" ref={notificationRef} style={{ position: 'relative' }}>
              <button 
                className={`icon-btn ${showNotifications ? 'active' : ''}`} 
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
                style={{ position: 'relative' }}
              >
                <BellIcon />
                <span className="notification-badge">3</span>
              </button>
              
              {showNotifications && (
                <div className="notification-modal">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <button className="mark-read-btn">Mark all as read</button>
                  </div>
                  <div className="notification-list">
                    <div className="notification-item unread">
                      <div className="notification-icon new-project">🚀</div>
                      <div className="notification-content">
                        <p className="notification-text">New project <strong>"Eco Farm"</strong> was submitted for review.</p>
                        <span className="notification-time">2 mins ago</span>
                      </div>
                    </div>
                    <div className="notification-item unread">
                      <div className="notification-icon system">⚠️</div>
                      <div className="notification-content">
                        <p className="notification-text">System maintenance scheduled for tonight at 2:00 AM.</p>
                        <span className="notification-time">1 hour ago</span>
                      </div>
                    </div>
                    <div className="notification-item">
                      <div className="notification-icon user">👤</div>
                      <div className="notification-content">
                        <p className="notification-text">New user registration: <strong>John Doe</strong>.</p>
                        <span className="notification-time">3 hours ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="notification-footer">
                    <button className="view-all-btn">View all notifications</button>
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">{user?.name || 'Loading...'}</span>
                <span className="user-role">{user?.role || 'Loading...'}</span>
              </div>
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
