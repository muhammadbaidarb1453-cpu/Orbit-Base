import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export default function FounderDashboard() {
  const { user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/startups').then((r) => setStartups(r.data)).finally(() => setLoading(false));
  }, []);

  const totalMilestones = startups.reduce((a, s) => a + (s._count?.milestones || 0), 0);
  const accepted = startups.filter((s) => s.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="page-heading">Welcome back, {user?.name?.split(' ')[0]}</h1>
        </div>
        <Link to="/founder/submit" className="btn-primary flex items-center gap-2">
          <span>+</span> New Startup
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Startups</p>
          <p className="stat-number text-f-blue">{startups.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Milestones</p>
          <p className="stat-number text-teal">{totalMilestones}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Accepted</p>
          <p className="stat-number text-f-green">{accepted}</p>
        </div>
      </div>

      {/* Startups list */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading">Your Startups</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="spinner w-6 h-6" />
          </div>
        ) : startups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-xl bg-raised border border-edge flex items-center justify-center mx-auto mb-4">
              <span className="text-ash text-xl">⊹</span>
            </div>
            <p className="text-ash text-sm mb-4">No startups yet. Submit your first one to get started.</p>
            <Link to="/founder/submit" className="btn-primary">Submit Startup</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {startups.map((s) => (
              <Link
                key={s.id}
                to={`/founder/startup/${s.id}`}
                className="flex items-start justify-between p-4 rounded-lg border border-edge hover:border-edge-hi hover:bg-raised transition-all duration-150 group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-grotesk font-semibold text-chalk text-sm group-hover:text-teal transition-colors">{s.name}</h3>
                  <p className="text-xs text-ash mt-0.5">{s.industry} · {s.fundingStage}</p>
                  <p className="text-xs text-dim mt-1.5 line-clamp-1">{s.description}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <StatusBadge status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { to: '/founder/mentors', label: 'Find a Mentor', desc: 'Browse and request mentors', icon: '⟡' },
          { to: '/founder/meetings', label: 'Meetings', desc: 'View investor meetings', icon: '◷' },
          { to: '/founder/messages', label: 'Messages', desc: 'Chat with mentors & investors', icon: '⌨' },
        ].map(({ to, label, desc, icon }) => (
          <Link key={to} to={to} className="card-interactive">
            <div className="w-9 h-9 rounded-lg bg-raised border border-edge flex items-center justify-center mb-3 text-teal">
              <span className="text-lg">{icon}</span>
            </div>
            <h3 className="font-grotesk font-semibold text-chalk text-sm">{label}</h3>
            <p className="text-xs text-ash mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
