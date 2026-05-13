import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusStyles = {
  PENDING:  'bg-f-amber/10 text-f-amber border border-f-amber/20',
  ACCEPTED: 'bg-f-green/10 text-f-green border border-f-green/20',
  DECLINED: 'bg-f-red/10 text-f-red border border-f-red/20',
};

export default function MentorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentors/requests').then((r) => setRequests(r.data)).finally(() => setLoading(false));
  }, []);

  const respond = async (id, status) => {
    try {
      await api.patch(`/mentors/request/${id}`, { status });
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast.success(`Request ${status.toLowerCase()}`);
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Inbox</p>
        <h1 className="page-heading">Mentorship Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-12 h-12 rounded-xl bg-raised border border-edge flex items-center justify-center mx-auto mb-4">
            <span className="text-ash text-xl">◌</span>
          </div>
          <p className="text-chalk text-sm font-medium mb-1">No requests yet</p>
          <p className="text-ash text-xs">Founders will send mentorship requests here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-grotesk font-semibold text-chalk">{r.startup.name}</h3>
                    <span className={`badge text-[11px] ${statusStyles[r.status]}`}>{r.status}</span>
                  </div>
                  <p className="text-xs text-ash">{r.startup.industry} · {r.startup.fundingStage}</p>
                  <p className="text-xs text-ash mt-0.5">From: {r.founder.name} ({r.founder.email})</p>

                  {r.startup.description && (
                    <p className="text-xs text-dim mt-2 line-clamp-2 leading-relaxed">{r.startup.description}</p>
                  )}

                  {r.message && (
                    <div className="mt-3 p-3 bg-raised rounded-lg border border-edge">
                      <p className="text-[10px] text-ash font-semibold uppercase tracking-wider mb-1">Message from founder</p>
                      <p className="text-xs text-chalk leading-relaxed">{r.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {r.status === 'PENDING' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-edge">
                  <button onClick={() => respond(r.id, 'DECLINED')} className="btn-secondary flex-1">
                    Decline
                  </button>
                  <button onClick={() => respond(r.id, 'ACCEPTED')} className="btn-primary flex-1">
                    Accept
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
