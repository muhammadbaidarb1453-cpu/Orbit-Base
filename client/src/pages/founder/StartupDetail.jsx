import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';

export default function StartupDetail() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/startups/${id}`).then((r) => setStartup(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }
  if (!startup) return <p className="text-ash">Startup not found.</p>;

  const milestonePct = startup.milestones.length
    ? Math.round((startup.milestones.filter((m) => m.status === 'COMPLETED').length / startup.milestones.length) * 100)
    : 0;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <Link to="/founder" className="text-xs text-ash hover:text-teal transition-colors">← Back</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="page-heading">{startup.name}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="tag">{startup.industry}</span>
              <span className="tag">{startup.fundingStage}</span>
              {startup.location && <span className="tag">⊹ {startup.location}</span>}
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className="tag hover:border-teal hover:text-teal transition-colors">
                  ↗ Website
                </a>
              )}
            </div>
          </div>
          <StatusBadge status={startup.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="card">
            <h2 className="section-heading mb-3">About</h2>
            <p className="text-ash text-sm leading-relaxed">{startup.description}</p>
            {startup.pitchDeckName && (
              <a
                href={startup.pitchDeckUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-xs font-semibold text-teal hover:text-teal-hi transition-colors"
              >
                <span>◈</span> {startup.pitchDeckName}
              </a>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="section-heading mb-4">Application Timeline</h2>
            <div className="space-y-3">
              {startup.statusHistory.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal mt-0.5 flex-shrink-0" />
                    {i < startup.statusHistory.length - 1 && (
                      <div className="w-px bg-edge flex-1 mt-1" />
                    )}
                  </div>
                  <div className="pb-3">
                    <StatusBadge status={h.status} />
                    <p className="text-xs text-dim mt-1">
                      {format(new Date(h.changedAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                    {h.note && <p className="text-xs text-ash mt-1">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {startup.milestones.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="section-heading">Milestones</h2>
                <span className="text-xs text-ash">{milestonePct}% complete</span>
              </div>
              <div className="w-full bg-raised rounded-full h-1.5 mb-4">
                <div
                  className="bg-teal h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${milestonePct}%` }}
                />
              </div>
              <div className="space-y-2">
                {startup.milestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-raised border border-edge">
                    <span className={`text-sm flex-shrink-0 mt-0.5 ${
                      m.status === 'COMPLETED' ? 'text-f-green' :
                      m.status === 'IN_PROGRESS' ? 'text-f-blue' : 'text-ash'
                    }`}>
                      {m.status === 'COMPLETED' ? '✓' : m.status === 'IN_PROGRESS' ? '◌' : '○'}
                    </span>
                    <div>
                      <p className="font-medium text-chalk text-xs">{m.title}</p>
                      {m.description && <p className="text-xs text-ash mt-0.5">{m.description}</p>}
                      <p className="text-xs text-dim mt-1">Due: {format(new Date(m.dueDate), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluations */}
          {startup.evaluations.length > 0 && (
            <div className="card">
              <h2 className="section-heading mb-4">Evaluations</h2>
              <div className="space-y-3">
                {startup.evaluations.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-lg bg-raised border border-edge">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-edge flex items-center justify-center text-xs font-medium text-chalk">
                          {ev.reviewer.name[0]}
                        </div>
                        <span className="text-sm font-semibold text-chalk">{ev.reviewer.name}</span>
                        <span className="text-xs text-ash">{ev.reviewer.role}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < ev.rating ? 'text-f-amber' : 'text-edge'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-ash leading-relaxed">{ev.comments}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {startup.mentorships.some((m) => m.status === 'ACCEPTED') ? (
            <div className="card">
              <h3 className="section-heading text-sm mb-3">Your Mentor</h3>
              {startup.mentorships.filter((m) => m.status === 'ACCEPTED').map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-f-green/10 border border-f-green/20 flex items-center justify-center font-bold text-f-green">
                    {m.mentor.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-chalk">{m.mentor.name}</p>
                    {m.mentor.bio && <p className="text-xs text-ash line-clamp-2 mt-0.5">{m.mentor.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-6">
              <p className="text-xs text-ash mb-3">No mentor assigned yet</p>
              <Link to="/founder/mentors" className="btn-primary text-xs py-1.5 px-4">Find a Mentor</Link>
            </div>
          )}

          {startup.meetings.length > 0 && (
            <div className="card">
              <h3 className="section-heading text-sm mb-3">Upcoming Meetings</h3>
              <div className="space-y-2">
                {startup.meetings.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-raised border border-edge">
                    <p className="text-xs font-semibold text-chalk">{m.title}</p>
                    <p className="text-xs text-ash mt-1">
                      {format(new Date(m.scheduledAt), 'MMM d, yyyy · h:mm a')}
                    </p>
                    <span className={`text-[10px] mt-1.5 inline-block ${m.confirmed ? 'text-f-green' : 'text-f-amber'}`}>
                      {m.confirmed ? '● Confirmed' : '● Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
