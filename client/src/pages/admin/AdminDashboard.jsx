import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = {
  PENDING:      '#FBBF24',
  UNDER_REVIEW: '#5B8EFF',
  SHORTLISTED:  '#B17AF5',
  ACCEPTED:     '#34D399',
  REJECTED:     '#F87171',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-raised border border-edge rounded-lg px-3 py-2 text-xs">
        <p className="text-chalk font-semibold">{payload[0].name}</p>
        <p className="text-ash">{payload[0].value} startup{payload[0].value !== 1 ? 's' : ''}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  const chartData = stats?.statusBreakdown?.map((s) => ({
    name: s.status.replace('_', ' '),
    value: s._count.status,
    color: STATUS_COLORS[s.status],
  })) || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Control Center</p>
        <h1 className="page-heading">Admin Dashboard</h1>
        <p className="text-ash text-sm mt-1">Platform overview and management</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner w-6 h-6" /></div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-label">Active Users</p>
              <p className="stat-number text-f-blue">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Startups</p>
              <p className="stat-number text-f-green">{stats.totalStartups}</p>
            </div>
            <div className={`stat-card ${stats.pendingApprovals > 0 ? 'border-l-4 border-l-f-amber' : ''}`}>
              <p className="stat-label">Pending Approvals</p>
              <p className={`stat-number ${stats.pendingApprovals > 0 ? 'text-f-amber' : 'text-chalk'}`}>
                {stats.pendingApprovals}
              </p>
              {stats.pendingApprovals > 0 && (
                <Link to="/admin/users" className="text-xs text-teal hover:text-teal-hi transition-colors mt-1 block">
                  Review now →
                </Link>
              )}
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <h2 className="section-heading mb-5">Startup Status Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span style={{ color: '#7D8FA9', fontSize: '11px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { to: '/admin/users', label: 'Manage Users', desc: 'Approve, deactivate, or change roles', icon: '⊚' },
              { to: '/admin/startups', label: 'Manage Startups', desc: 'Review and update application statuses', icon: '⊹' },
              { to: '/admin/audit', label: 'Audit Log', desc: 'Track all admin actions', icon: '≡' },
            ].map(({ to, label, desc, icon }) => (
              <Link key={to} to={to} className="card-interactive">
                <div className="w-9 h-9 rounded-lg bg-raised border border-edge flex items-center justify-center mb-3 text-f-amber">
                  <span className="text-lg">{icon}</span>
                </div>
                <h3 className="font-grotesk font-semibold text-chalk text-sm">{label}</h3>
                <p className="text-xs text-ash mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
