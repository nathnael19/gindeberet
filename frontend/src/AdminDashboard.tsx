import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectsApi, activityApi, dashboardApi } from './api';
import AdminLayout from './AdminLayout';
import { formatBirr } from './format';
import './AdminDashboard.css';

interface DashboardProject {
  id: string | number;
  name: string;
  client: string;
  budget: string;
  status: string;
}

interface DashboardActivity {
  id?: string | number;
  user?: string;
  action?: string;
  target?: string;
  time?: string;
}

export default function AdminDashboard({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [revenueData, setRevenueData] = useState<any[]>([]);

  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [recentProjects, setRecentProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });
  const [kpiData, setKpiData] = useState({
    totalRevenue: null,
    teamMembers: null,
    incidentReports: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const projectsResponse = await projectsApi.getAllCached(undefined, (freshResponse) => {
          if (isActive && freshResponse.success) {
            setRecentProjects(freshResponse.data.slice(0, 4));
          }
        });

        if (!isActive) {
          return;
        }

        if (projectsResponse.success) {
          setRecentProjects(projectsResponse.data.slice(0, 4));
        }

        const activitiesResponse = await activityApi.getRecentCached(4, (freshResponse) => {
          if (isActive && freshResponse.success) {
            setActivities(freshResponse.data);
          }
        });

        if (!isActive) {
          return;
        }

        if (activitiesResponse.success) {
          setActivities(activitiesResponse.data);
        }

        const statsResponse = await projectsApi.getStatsCached((freshResponse) => {
          if (isActive && freshResponse.success) {
            setStats({
              total: freshResponse.data.total,
              active: freshResponse.data.byStatus.ACTIVE || 0,
              completed: freshResponse.data.byStatus.COMPLETED || 0,
              pending: freshResponse.data.byStatus.PENDING || 0,
            });
          }
        });

        if (!isActive) {
          return;
        }

        if (statsResponse.success) {
          setStats({
            total: statsResponse.data.total,
            active: statsResponse.data.byStatus.ACTIVE || 0,
            completed: statsResponse.data.byStatus.COMPLETED || 0,
            pending: statsResponse.data.byStatus.PENDING || 0,
          });
        }

        const revenueResponse = await dashboardApi.getRevenueCached((freshResponse) => {
          if (isActive && freshResponse.success) {
            setRevenueData(freshResponse.data);
          }
        });

        if (!isActive) {
          return;
        }

        if (revenueResponse.success) {
          setRevenueData(revenueResponse.data);
        } else {
          setRevenueData([]);
        }

        const kpiResponse = await dashboardApi.getKPICached((freshResponse) => {
          if (isActive && freshResponse.success) {
            setKpiData(freshResponse.data);
          }
        });

        if (!isActive) {
          return;
        }

        if (kpiResponse.success) {
          setKpiData(kpiResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isActive = false;
    };
  }, []);

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
          <div className="kpi-value">{isLoading ? '...' : stats.active}</div>
          <div className="kpi-trend trend-up">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <span>{stats.total} total projects</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Revenue (YTD)</span>
            <div className="kpi-icon">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="kpi-value">{kpiData.totalRevenue || 'N/A'}</div>
          <div className="kpi-trend trend-neutral">
            <span>Year to date</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Team Members</span>
            <div className="kpi-icon"><TeamIcon /></div>
          </div>
          <div className="kpi-value">{kpiData.teamMembers || 'N/A'}</div>
          <div className="kpi-trend trend-neutral">
            <span>Active members</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Incident Reports</span>
            <div className="kpi-icon" style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
          </div>
          <div className="kpi-value">{kpiData.incidentReports ?? 'N/A'}</div>
          <div className="kpi-trend trend-neutral">
            <span>Total logged</span>
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
            {revenueData.length > 0 ? (
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
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} tickFormatter={(v) => `ETB ${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-main)', fontWeight: 500 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                No revenue data available
              </div>
            )}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td>
                  </tr>
                ) : recentProjects.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No projects yet</td>
                  </tr>
                ) : (
                  recentProjects.map((project) => (
                    <tr key={project.id}>
                      <td style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{project.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{project.name}</td>
                      <td>{project.client}</td>
                      <td style={{ fontFamily: 'var(--font-heading)' }}>{formatBirr(project.budget)}</td>                      <td>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
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
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent activity</div>
            ) : (
              activities.map((activity, idx) => (
                <div className="activity-item" key={activity.id || idx}>
                  <div className="activity-icon">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      <strong>{activity.user}</strong> {activity.action} {activity.target && <strong>{activity.target}</strong>}
                    </div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
