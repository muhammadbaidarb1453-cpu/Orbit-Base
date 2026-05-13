import { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

const statusActionStyle = {
  ACCEPTED:     'bg-f-green/10 text-f-green border border-f-green/20 hover:bg-f-green/20',
  REJECTED:     'bg-f-red/10 text-f-red border border-f-red/20 hover:bg-f-red/20',
  SHORTLISTED:  'bg-f-violet/10 text-f-violet border border-f-violet/20 hover:bg-f-violet/20',
  UNDER_REVIEW: 'bg-f-blue/10 text-f-blue border border-f-blue/20 hover:bg-f-blue/20',
  PENDING:      'bg-f-amber/10 text-f-amber border border-f-amber/20 hover:bg-f-amber/20',
};

export default function AdminStartups() {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    api.get('/startups').then((r) => setStartups(r.data)).finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/startups/${id}/status`, { status, note });
      setStartups((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      setUpdating(null);
      setNote('');
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Review</p>
        <h1 className="page-heading">Startup Management</h1>
      </div>

      <div className="space-y-3">
        {startups.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-ash text-sm">No startups yet.</p>
          </div>
        ) : (
          startups.map((s) => (
            <div key={s.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-grotesk font-semibold text-chalk">{s.name}</h3>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="text-xs text-ash">{s.industry} · {s.fundingStage}</p>
                  <p className="text-xs text-dim mt-0.5">
                    {s.founder?.name} · {s.founder?.email}
                  </p>
                  <p className="text-xs text-ash mt-2 line-clamp-2 leading-relaxed">{s.description}</p>
                </div>
                <button
                  onClick={() => setUpdating(updating === s.id ? null : s.id)}
                  className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0"
                >
                  {updating === s.id ? 'Close' : 'Change Status'}
                </button>
              </div>

              {updating === s.id && (
                <div className="mt-4 pt-4 border-t border-edge">
                  <div className="mb-3">
                    <label className="label">Admin note (optional)</label>
                    <input
                      className="input text-sm max-w-sm"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Reason for status change..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        onClick={() => changeStatus(s.id, st)}
                        disabled={s.status === st}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed ${statusActionStyle[st]}`}
                      >
                        → {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
