import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
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
  year?: string;
  category?: string;
}

interface DashboardActivity {
  id?: string | number;
  user?: string;
  action?: string;
  target?: string;
  time?: string;
}

interface AnalyticsData {
  byYear: { year: string; projects: number; capital: number }[];
  byCategory: { name: string; projects: number; capital: number }[];
  growth: { year: string; capital: number; projects: number; cumulative: number }[];
  summary: {
    totalProjects: number;
    totalCapital: number;
    totalCapitalLabel: string;
    avgCapital: number;
    avgCapitalLabel: string;
    peakYear: string | null;
    peakYearProjects: number;
    peakYearCapital: number;
    peakYearCapitalLabel: string;
    byStatus: { ACTIVE: number; COMPLETED: number; PENDING: number };
  };
}

const go = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

function statusClass(status: string) {
  const s = (status || '').toLowerCase();
  if (s === 'active' || s === 'completed' || s === 'pending') return `status-${s}`;
  return 'status-pending';
}

function shortMoney(value: number) {
  if (!value) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

const CATEGORY_COLORS = ['#EAB308', '#0EA5E9', '#22C55E', '#F97316', '#A855F7', '#EF4444', '#14B8A6', '#64748B'];

const emptyAnalytics: AnalyticsData = {
  byYear: [],
  byCategory: [],
  growth: [],
  summary: {
    totalProjects: 0,
    totalCapital: 0,
    totalCapitalLabel: 'ETB 0',
    avgCapital: 0,
    avgCapitalLabel: 'ETB 0',
    peakYear: null,
    peakYearProjects: 0,
    peakYearCapital: 0,
    peakYearCapitalLabel: 'ETB 0',
    byStatus: { ACTIVE: 0, COMPLETED: 0, PENDING: 0 },
  },
};

export default function AdminDashboard({
  isDarkTheme,
  toggleTheme,
}: {
  isDarkTheme: boolean;
  toggleTheme: () => void;
}) {
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [recentProjects, setRecentProjects] = useState<DashboardProject[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(emptyAnalytics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [projectsResponse, activitiesResponse, analyticsResponse] = await Promise.all([
          projectsApi.getAllCached(undefined, (fresh) => {
            if (isActive && fresh.success) setRecentProjects(fresh.data.slice(0, 6));
          }),
          activityApi.getRecentCached(5, (fresh) => {
            if (isActive && fresh.success) setActivities(fresh.data);
          }),
          dashboardApi.getAnalyticsCached((fresh) => {
            if (isActive && fresh.success) setAnalytics(fresh.data);
          }),
        ]);

        if (!isActive) return;

        if (projectsResponse.success) setRecentProjects(projectsResponse.data.slice(0, 6));
        if (activitiesResponse.success) setActivities(activitiesResponse.data);
        if (analyticsResponse.success) setAnalytics(analyticsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isActive = false;
    };
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const summary = analytics.summary;
  const kpis = [
    { label: 'All projects', value: summary.totalProjects, tone: 'neutral' as const },
    { label: 'Completed', value: summary.byStatus.COMPLETED, tone: 'ok' as const },
    { label: 'Peak year', value: summary.peakYear || '—', tone: 'info' as const },
    { label: 'Projects in peak year', value: summary.peakYearProjects, tone: 'warn' as const },
  ];

  const tooltipStyle = {
    background: 'var(--bg-offset)',
    border: '1px solid var(--border-color)',
    borderRadius: 8,
    fontSize: 12,
  };

  return (
    <AdminLayout isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} activePage="overview">
      <div className="dash-home">
        <header className="dash-hero">
          <div>
            <p className="dash-kicker">{today}</p>
            <h1 className="dash-title">Work overview</h1>
            <p className="dash-sub">
              Charts built from real project records — volume by year, capital, category mix, and growth.
            </p>
          </div>
          <div className="dash-quick">
            <button type="button" className="dash-quick-btn primary" onClick={() => go('/projects')}>
              Projects
            </button>
            <button type="button" className="dash-quick-btn" onClick={() => go('/vacancies')}>
              Careers
            </button>
            <button type="button" className="dash-quick-btn" onClick={() => go('/stamp-sign')}>
              Stamp & Sign
            </button>
            <button type="button" className="dash-quick-btn" onClick={() => go('/settings')}>
              Settings
            </button>
          </div>
        </header>

        <section className="dash-kpi-row">
          {kpis.map((kpi) => (
            <article key={kpi.label} className={`dash-kpi dash-kpi--${kpi.tone}`}>
              <span>{kpi.label}</span>
              <strong>{isLoading ? '—' : kpi.value}</strong>
            </article>
          ))}
        </section>

        <section className="dash-meta-row">
          <div className="dash-meta-card">
            <span>Total capital (all projects)</span>
            <strong>{isLoading ? '—' : summary.totalCapitalLabel}</strong>
          </div>
          <div className="dash-meta-card">
            <span>Average contract value</span>
            <strong>{isLoading ? '—' : summary.avgCapitalLabel}</strong>
          </div>
          <div className="dash-meta-card">
            <span>Peak-year capital</span>
            <strong>{isLoading ? '—' : summary.peakYearCapitalLabel}</strong>
          </div>
        </section>

        <div className="dash-charts-grid">
          <section className="dash-panel dash-panel--chart">
            <div className="dash-panel-head">
              <h2>Projects by year</h2>
              <span className="dash-panel-note">Which years carried the most work</span>
            </div>
            <div className="dash-chart">
              {analytics.byYear.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={analytics.byYear} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => [
                        value,
                        name === 'projects' ? 'Projects' : name,
                      ]}
                    />
                    <Bar dataKey="projects" fill="var(--cta)" radius={[6, 6, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="dash-empty">{isLoading ? 'Loading…' : 'No project data yet'}</div>
              )}
            </div>
          </section>

          <section className="dash-panel dash-panel--chart">
            <div className="dash-panel-head">
              <h2>Capital by year</h2>
              <span className="dash-panel-note">Contract value (ETB) per year</span>
            </div>
            <div className="dash-chart">
              {analytics.byYear.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={analytics.byYear} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashCapital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={(v) => shortMoney(Number(v))}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any) => [`ETB ${Number(value).toLocaleString()}`, 'Capital']}
                    />
                    <Area
                      type="monotone"
                      dataKey="capital"
                      stroke="#0EA5E9"
                      fill="url(#dashCapital)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="dash-empty">{isLoading ? 'Loading…' : 'No capital data yet'}</div>
              )}
            </div>
          </section>

          <section className="dash-panel dash-panel--chart">
            <div className="dash-panel-head">
              <h2>Growth (cumulative capital)</h2>
              <span className="dash-panel-note">How total contract value grew over years</span>
            </div>
            <div className="dash-chart">
              {analytics.growth.length > 0 ? (
                <ResponsiveContainer>
                  <ComposedChart data={analytics.growth} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      tickFormatter={(v) => shortMoney(Number(v))}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, name: any) => {
                        if (name === 'projects') return [value, 'Projects that year'];
                        return [`ETB ${Number(value).toLocaleString()}`, name === 'cumulative' ? 'Cumulative' : 'Year capital'];
                      }}
                    />
                    <Bar yAxisId="right" dataKey="projects" fill="#FDE68A" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#16A34A"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: '#16A34A' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="dash-empty">{isLoading ? 'Loading…' : 'No growth data yet'}</div>
              )}
            </div>
          </section>

          <section className="dash-panel dash-panel--chart">
            <div className="dash-panel-head">
              <h2>Mix by category</h2>
              <span className="dash-panel-note">Share of projects across service types</span>
            </div>
            <div className="dash-chart dash-chart--pie">
              {analytics.byCategory.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.byCategory}
                      dataKey="projects"
                      nameKey="name"
                      cx="50%"
                      cy="48%"
                      innerRadius={52}
                      outerRadius={84}
                      paddingAngle={2}
                    >
                      {analytics.byCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: any, _n: any, item: any) => {
                        const capital = item?.payload?.capital || 0;
                        return [`${value} projects · ETB ${Number(capital).toLocaleString()}`, item?.payload?.name];
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="dash-empty">{isLoading ? 'Loading…' : 'No category data yet'}</div>
              )}
            </div>
          </section>
        </div>

        <div className="dash-main-grid">
          <section className="dash-panel dash-panel--projects">
            <div className="dash-panel-head">
              <h2>Recent projects</h2>
              <button type="button" className="dash-link" onClick={() => go('/projects')}>
                View all →
              </button>
            </div>
            {isLoading ? (
              <div className="dash-empty">Loading…</div>
            ) : recentProjects.length === 0 ? (
              <div className="dash-empty">No projects yet</div>
            ) : (
              <ul className="dash-project-list">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <div className="dash-project-main">
                      <strong>{project.name}</strong>
                      <span>
                        {project.client}
                        {project.year ? ` · ${project.year}` : ''}
                        {project.category ? ` · ${project.category}` : ''}
                      </span>
                    </div>
                    <div className="dash-project-meta">
                      <span className="dash-budget">{formatBirr(project.budget)}</span>
                      <span className={`status-badge ${statusClass(project.status)}`}>
                        {(project.status || '').charAt(0).toUpperCase() +
                          (project.status || '').slice(1).toLowerCase()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dash-panel">
            <div className="dash-panel-head">
              <h2>Activity</h2>
            </div>
            <div className="dash-activity">
              {isLoading ? (
                <div className="dash-empty">Loading…</div>
              ) : activities.length === 0 ? (
                <div className="dash-empty">No recent activity</div>
              ) : (
                activities.map((activity, idx) => (
                  <div className="dash-activity-item" key={activity.id || idx}>
                    <div className="dash-activity-dot" />
                    <div>
                      <p>
                        <strong>{activity.user}</strong> {activity.action}{' '}
                        {activity.target && <span>{activity.target}</span>}
                      </p>
                      <time>{activity.time}</time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
