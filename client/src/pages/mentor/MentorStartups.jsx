import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function MentorStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentors/my-startups').then((r) => setStartups(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Portfolio</p>
        <h1 className="page-heading">Assigned Startups</h1>
      </div>

      {startups.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-12 h-12 rounded-xl bg-raised border border-edge flex items-center justify-center mx-auto mb-4">
            <span className="text-ash text-xl">⊹</span>
          </div>
          <p className="text-chalk text-sm font-medium mb-1">No startups assigned yet</p>
          <p className="text-ash text-xs">Accept mentorship requests to build your portfolio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {startups.map((s) => (
            <Link key={s.id} to={`/mentor/startups/${s.id}`} className="card-interactive">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-grotesk font-semibold text-chalk">{s.name}</h3>
                <StatusBadge status={s.status} />
              </div>
              <p className="text-xs text-ash mb-1">{s.industry} · {s.fundingStage}</p>
              <p className="text-xs text-dim line-clamp-2 leading-relaxed">{s.description}</p>

              {s.milestones?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-edge">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-ash">Milestones</span>
                    <span className="text-chalk font-medium">
                      {s.milestones.filter((m) => m.status === 'COMPLETED').length}/{s.milestones.length}
                    </span>
                  </div>
                  <div className="w-full bg-raised rounded-full h-1.5">
                    <div
                      className="bg-f-green h-1.5 rounded-full transition-all"
                      style={{ width: `${(s.milestones.filter((m) => m.status === 'COMPLETED').length / s.milestones.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
