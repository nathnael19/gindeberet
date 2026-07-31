import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ALL_PROJECTS } from './adminData';
import AdminLayout from './AdminLayout';
import './AdminDashboard.css';

export default function AdminDashboard({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const revenueData = [
    { name: 'Jan', revenue: 4200 },
    { name: 'Feb', revenue: 3800 },
    { name: 'Mar', revenue: 5100 },
    { name: 'Apr', revenue: 4700 },
    { name: 'May', revenue: 6200 },
    { name: 'Jun', revenue: 5900 },
    { name: 'Jul', revenue: 7500 },
  ];

  const activities = [
    { id: 1, user: 'Sarah Jenkins', action: 'approved milestone 3 on', target: 'Highway 401', time: '2 hours ago' },
    { id: 2, user: 'Mike Chen', action: 'uploaded new schematics for', target: 'River Bridge', time: '5 hours ago' },
    { id: 3, user: 'System', action: 'generated weekly report', target: 'Q3 Financials', time: '1 day ago' },
    { id: 4, user: 'Elena Rossi', action: 'added a new team member to', target: 'Downtown Utility', time: '1 day ago' },
  ];

  const recentProjects = ALL_PROJECTS.slice(0, 4);

  const ProjectsIcon = () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );

  const TeamIcon = () => (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="overview">
      <h1 className="page-title">Dashboard Overview</h1>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Active Projects</span>
            <div className="kpi-icon"><ProjectsIcon /></div>
          </div>
          <div className="kpi-value">12</div>
          <div className="kpi-trend trend-up">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span>+2 this month</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Revenue (YTD)</span>
            <div className="kpi-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="kpi-value">$254M</div>
          <div className="kpi-trend trend-up">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span>+14.5% vs last year</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Team Members</span>
            <div className="kpi-icon"><TeamIcon /></div>
          </div>
          <div className="kpi-value">148</div>
          <div className="kpi-trend trend-neutral">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" /></svg>
            <span>No change</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Incident Reports</span>
            <div className="kpi-icon" style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="kpi-value">0</div>
          <div className="kpi-trend trend-up">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            <span>Zero incidents in 90 days</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Revenue chart */}
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h2 className="panel-title">Revenue Overview</h2>
          </div>
          <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Projects</h2>
            <a
              href="/projects"
              className="panel-action"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/projects');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
            >
              View All →
            </a>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{project.name}</td>
                    <td>{project.client}</td>
                    <td style={{ fontFamily: 'var(--font-heading)' }}>{project.budget}</td>
                    <td>
                      <span className={`status-badge status-${project.status}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Activity</h2>
            <a href="#" className="panel-action">View All</a>
          </div>
          <div className="activity-list">
            {activities.map((activity, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-icon">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.user}</strong> {activity.action} <strong>{activity.target}</strong>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
