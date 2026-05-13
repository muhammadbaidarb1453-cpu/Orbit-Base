import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/startups'), api.get('/meetings')])
      .then(([s, m]) => { setStartups(s.data); setMeetings(m.data); })
      .finally(() => setLoading(false));
  }, []);

  const featured = startups.filter((s) => ['SHORTLISTED', 'ACCEPTED'].includes(s.status)).slice(0, 3);
  const avgRating = (s) => s.evaluations?.length
    ? (s.evaluations.reduce((a, e) => a + e.rating, 0) / s.evaluations.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="page-heading">Welcome back, {user?.name?.split(' ')[0]}</h1>
        </div>
        <Link to="/investor/startups" className="btn-primary">Browse Startups</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Total Startups</p>
          <p className="stat-number text-f-violet">{startups.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Shortlisted / Accepted</p>
          <p className="stat-number text-f-green">
            {startups.filter((s) => ['SHORTLISTED', 'ACCEPTED'].includes(s.status)).length}
          </p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Scheduled Meetings</p>
          <p className="stat-number text-teal">{meetings.length}</p>
        </div>
      </div>

      {/* Top opportunities */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading">Top Opportunities</h2>
          <Link to="/investor/startups" className="text-xs text-ash hover:text-teal transition-colors">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner w-6 h-6" /></div>
        ) : featured.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-ash text-sm">No shortlisted startups yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {featured.map((s) => (
              <Link
                key={s.id}
                to={`/investor/startups/${s.id}`}
                className="flex items-start justify-between p-4 rounded-lg border border-edge hover:border-f-violet/40 hover:bg-raised transition-all duration-150 group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-grotesk font-semibold text-chalk text-sm group-hover:text-f-violet transition-colors">{s.name}</h3>
                    {avgRating(s) && (
                      <span className="text-xs font-medium text-f-amber">★ {avgRating(s)}</span>
                    )}
                  </div>
                  <p className="text-xs text-ash mt-0.5">{s.industry} · {s.fundingStage}</p>
                  <p className="text-xs text-dim mt-1 line-clamp-1">{s.description}</p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming meetings */}
      {meetings.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-heading">Upcoming Meetings</h2>
            <Link to="/investor/meetings" className="text-xs text-ash hover:text-teal transition-colors">View all →</Link>
          </div>
          <div className="space-y-0 divide-y divide-edge">
            {meetings.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-chalk">{m.title}</p>
                  <p className="text-xs text-ash">With {m.founder?.name}</p>
                </div>
                <span className={`badge text-[11px] ${m.confirmed ? 'bg-f-green/10 text-f-green border border-f-green/20' : 'bg-f-amber/10 text-f-amber border border-f-amber/20'}`}>
                  {m.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
