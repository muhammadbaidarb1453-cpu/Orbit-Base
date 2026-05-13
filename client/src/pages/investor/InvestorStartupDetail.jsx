import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function InvestorStartupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [evalForm, setEvalForm] = useState({ rating: 5, comments: '' });
  const [meetingForm, setMeetingForm] = useState({ title: '', scheduledAt: '', duration: 60, notes: '' });

  const load = () => api.get(`/startups/${id}`).then((r) => setStartup(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const submitEval = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/startups/${id}/evaluate`, evalForm);
      toast.success('Evaluation submitted!');
      setShowEvalForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const scheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetings', { ...meetingForm, founderId: startup.founderId, startupId: id });
      toast.success('Meeting request sent!');
      setShowMeetingForm(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const messageFounder = () => navigate(`/investor/messages/${startup.founderId}`);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }
  if (!startup) return <p className="text-ash">Not found.</p>;

  const myEval = startup.evaluations.find((e) => e.reviewer.id === user.id);

  return (
    <div className="max-w-5xl space-y-5">
      {/* Header */}
      <div>
        <Link to="/investor/startups" className="text-xs text-ash hover:text-teal transition-colors">← Back to Startups</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="page-heading">{startup.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="tag">{startup.industry}</span>
              <span className="tag text-f-blue border-f-blue/20">{startup.fundingStage}</span>
              {startup.location && <span className="tag">⊹ {startup.location}</span>}
            </div>
          </div>
          <StatusBadge status={startup.status} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={messageFounder} className="btn-secondary">⌨ Message Founder</button>
        <button onClick={() => setShowMeetingForm(!showMeetingForm)} className="btn-secondary">◷ Schedule Meeting</button>
        {!myEval && (
          <button onClick={() => setShowEvalForm(!showEvalForm)} className="btn-primary">★ Submit Evaluation</button>
        )}
      </div>

      {/* Meeting form */}
      {showMeetingForm && (
        <div className="card border-l-4 border-l-f-violet">
          <h3 className="section-heading text-sm mb-4">Schedule a Meeting</h3>
          <form onSubmit={scheduleMeeting} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Meeting Title *</label>
                <input className="input" value={meetingForm.title} onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })} required placeholder="e.g. Investment Discussion" />
              </div>
              <div>
                <label className="label">Date & Time *</label>
                <input type="datetime-local" className="input" value={meetingForm.scheduledAt} onChange={(e) => setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })} required style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Duration</label>
                <select className="input" value={meetingForm.duration} onChange={(e) => setMeetingForm({ ...meetingForm, duration: Number(e.target.value) })}>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" value={meetingForm.notes} onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })} placeholder="Optional..." />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowMeetingForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Send Request</button>
            </div>
          </form>
        </div>
      )}

      {/* Eval form */}
      {showEvalForm && (
        <div className="card border-l-4 border-l-f-amber">
          <h3 className="section-heading text-sm mb-4">Submit Evaluation</h3>
          <form onSubmit={submitEval} className="space-y-4">
            <div>
              <label className="label">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setEvalForm({ ...evalForm, rating: n })}
                    className={`text-2xl transition-colors ${n <= evalForm.rating ? 'text-f-amber' : 'text-edge hover:text-ash'}`}>★</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Comments *</label>
              <textarea className="input resize-none" rows={4} value={evalForm.comments} onChange={(e) => setEvalForm({ ...evalForm, comments: e.target.value })} required placeholder="Your evaluation..." />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowEvalForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Submit Evaluation</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="card">
            <h2 className="section-heading mb-3">About</h2>
            <p className="text-ash text-sm leading-relaxed">{startup.description}</p>
            {startup.website && (
              <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-xs text-teal hover:text-teal-hi mt-3 inline-block transition-colors">
                ↗ {startup.website}
              </a>
            )}
            {startup.pitchDeckName && (
              <a href={startup.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 text-xs font-semibold text-teal hover:text-teal-hi transition-colors">
                <span>◈</span> {startup.pitchDeckName}
              </a>
            )}
          </div>

          {/* Evaluations */}
          {startup.evaluations.length > 0 && (
            <div className="card">
              <h2 className="section-heading mb-4">Evaluations</h2>
              <div className="space-y-3">
                {startup.evaluations.map((ev) => (
                  <div key={ev.id} className="p-4 rounded-lg bg-raised border border-edge">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-edge flex items-center justify-center text-xs font-medium text-chalk">{ev.reviewer.name[0]}</div>
                        <span className="text-sm font-semibold text-chalk">{ev.reviewer.name}</span>
                        <span className="text-xs text-ash">{ev.reviewer.role}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <span key={i} className={`text-sm ${i < ev.rating ? 'text-f-amber' : 'text-edge'}`}>★</span>)}
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
          <div className="card">
            <h3 className="section-heading text-sm mb-3">Founder</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-f-blue/10 border border-f-blue/20 flex items-center justify-center font-bold text-f-blue">
                {startup.founder?.name[0]}
              </div>
              <div>
                <p className="font-semibold text-chalk text-sm">{startup.founder?.name}</p>
                <p className="text-xs text-ash">{startup.founder?.email}</p>
              </div>
            </div>
            {startup.founder?.bio && <p className="text-xs text-ash mt-2 leading-relaxed">{startup.founder.bio}</p>}
          </div>

          <div className="card">
            <h3 className="section-heading text-sm mb-3">Application History</h3>
            <div className="space-y-2">
              {startup.statusHistory.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                  <div>
                    <StatusBadge status={h.status} />
                    <p className="text-[10px] text-ash mt-0.5">{format(new Date(h.changedAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
