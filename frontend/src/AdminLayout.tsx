import { type ReactNode } from 'react';
import './AdminDashboard.css';

interface AdminLayoutProps {
  children: ReactNode;
  isDarkTheme: boolean;
  toggleTheme: () => void;
  activePage: 'overview' | 'projects' | 'settings';
}

const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

export default function AdminLayout({ children, isDarkTheme, toggleTheme, activePage }: AdminLayoutProps) {
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

  const SearchIcon = () => (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const navItems = [
    { key: 'overview' as const, label: 'Overview', path: '/admin', Icon: HomeIcon },
    { key: 'projects' as const, label: 'Projects', path: '/projects', Icon: ProjectsIcon },
    { key: 'settings' as const, label: 'Settings', path: '/settings', Icon: SettingsIcon },
  ];

  return (
    <div className="admin-dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Gindeberet Logo" />
          <span>GINDEBERET<span className="accent">.</span></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ key, label, path, Icon }) => (
            <a
              key={key}
              href={path}
              className={`nav-item ${activePage === key ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); navigate(path); }}
            >
              <Icon />
              {label}
            </a>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => window.location.href = '/'}>
            <LogoutIcon />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-search">
            <SearchIcon />
            <input type="text" placeholder="Search projects, documents, or people..." />
          </div>
          <div className="header-actions">
            <button onClick={toggleTheme} className="icon-btn theme-toggle" aria-label="Toggle Theme" style={{ fontSize: '1.25rem', padding: '0.25rem' }}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <BellIcon />
            </button>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Superadmin</span>
              </div>
              <div className="user-avatar">A</div>
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
