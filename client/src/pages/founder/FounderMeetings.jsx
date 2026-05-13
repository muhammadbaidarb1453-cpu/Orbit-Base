import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FounderMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/meetings').then((r) => setMeetings(r.data)).finally(() => setLoading(false));
  }, []);

  const confirm = async (id) => {
    try {
      await api.patch(`/meetings/${id}/confirm`);
      setMeetings((prev) => prev.map((m) => m.id === id ? { ...m, confirmed: true } : m));
      toast.success('Meeting confirmed!');
    } catch {
      toast.error('Failed to confirm meeting');
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
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Schedule</p>
        <h1 className="page-heading">Meetings</h1>
      </div>

      {meetings.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-12 h-12 rounded-xl bg-raised border border-edge flex items-center justify-center mx-auto mb-4">
            <span className="text-ash text-xl">◷</span>
          </div>
          <p className="text-chalk text-sm font-medium mb-1">No meetings scheduled</p>
          <p className="text-ash text-xs">Investors will request meetings with you through the platform.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-grotesk font-semibold text-chalk">{m.title}</h3>
                  <p className="text-xs text-ash mt-1">With {m.investor?.name}</p>

                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal text-xs">◷</span>
                      <span className="text-xs text-ash">{format(new Date(m.scheduledAt), 'EEE, MMM d yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal text-xs">◌</span>
                      <span className="text-xs text-ash">{format(new Date(m.scheduledAt), 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-teal text-xs">⏱</span>
                      <span className="text-xs text-ash">{m.duration} min</span>
                    </div>
                  </div>

                  {m.startup && (
                    <p className="text-xs text-dim mt-2">Re: {m.startup.name}</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {m.confirmed ? (
                    <span className="badge bg-f-green/10 text-f-green border border-f-green/20 text-[11px]">Confirmed</span>
                  ) : (
                    <button onClick={() => confirm(m.id)} className="btn-primary text-xs py-1.5 px-3">
                      Confirm
                    </button>
                  )}
                </div>
              </div>

              {m.notes && (
                <p className="text-xs text-ash mt-3 pt-3 border-t border-edge leading-relaxed">{m.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
