import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [startups, setStartups] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/mentors/my-startups'), api.get('/mentors/requests')])
      .then(([s, r]) => {
        setStartups(s.data);
        setRequests(r.data.filter((r) => r.status === 'PENDING'));
      })
      .finally(() => setLoading(false));
  }, []);

  const totalMilestones = startups.reduce((a, s) => a + (s.milestones?.length || 0), 0);
  const completedMilestones = startups.reduce((a, s) => a + (s.milestones?.filter((m) => m.status === 'COMPLETED').length || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="page-heading">Welcome back, {user?.name?.split(' ')[0]}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="stat-label">Assigned Startups</p>
          <p className="stat-number text-f-green">{startups.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Requests</p>
          <p className="stat-number text-f-amber">{requests.length}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Milestones Done</p>
          <p className="stat-number text-teal">{completedMilestones}<span className="text-ash text-lg font-mono"> / {totalMilestones}</span></p>
        </div>
      </div>

      {/* Pending requests banner */}
      {requests.length > 0 && (
        <div className="card border-l-4 border-l-f-amber">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-f-amber text-sm">◌</span>
              <h2 className="font-grotesk font-semibold text-chalk text-sm">
                Pending Requests ({requests.length})
              </h2>
            </div>
            <Link to="/mentor/requests" className="text-xs text-teal hover:text-teal-hi transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {requests.slice(0, 2).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-t border-edge first:border-0">
                <div>
                  <p className="text-sm font-semibold text-chalk">{r.startup.name}</p>
                  <p className="text-xs text-ash">{r.founder.name} · {r.startup.industry}</p>
                </div>
                <Link to="/mentor/requests" className="btn-primary text-xs py-1 px-3">Review</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Startups */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading">My Startups</h2>
          <Link to="/mentor/startups" className="text-xs text-ash hover:text-teal transition-colors">View all →</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><span className="spinner w-6 h-6" /></div>
        ) : startups.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-ash text-sm">No startups assigned yet.</p>
            <p className="text-dim text-xs mt-1">Accept mentorship requests to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {startups.map((s) => (
              <Link
                key={s.id}
                to={`/mentor/startups/${s.id}`}
                className="flex items-start justify-between p-4 rounded-lg border border-edge hover:border-f-green/40 hover:bg-raised transition-all duration-150 group"
              >
                <div className="flex-1">
                  <h3 className="font-grotesk font-semibold text-chalk text-sm group-hover:text-f-green transition-colors">{s.name}</h3>
                  <p className="text-xs text-ash mt-0.5">{s.industry} · {s.fundingStage}</p>
                  <p className="text-xs text-dim mt-0.5">Founder: {s.founder?.name}</p>
                  {s.milestones?.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 max-w-[120px] bg-raised rounded-full h-1">
                        <div
                          className="bg-f-green h-1 rounded-full"
                          style={{ width: `${(s.milestones.filter((m) => m.status === 'COMPLETED').length / s.milestones.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-ash">
                        {s.milestones.filter((m) => m.status === 'COMPLETED').length}/{s.milestones.length}
                      </span>
                    </div>
                  )}
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
