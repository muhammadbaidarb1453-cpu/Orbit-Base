import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MentorStartupDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '' });

  const load = () => api.get(`/startups/${id}`).then((r) => setStartup(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [id]);

  const addMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post('/milestones', { ...milestoneForm, startupId: id });
      toast.success('Milestone created!');
      setShowMilestoneForm(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM' });
      load();
    } catch { toast.error('Failed to create milestone'); }
  };

  const updateMilestone = async (milestoneId, status) => {
    try {
      await api.patch(`/milestones/${milestoneId}`, { status });
      toast.success('Milestone updated!');
      load();
    } catch { toast.error('Update failed'); }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/startups/${id}/evaluate`, feedbackForm);
      toast.success('Feedback submitted!');
      setShowFeedbackForm(false);
      load();
    } catch { toast.error('Failed to submit feedback'); }
  };

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
    <div className="max-w-4xl space-y-5">
      <div>
        <Link to="/mentor/startups" className="text-xs text-ash hover:text-teal transition-colors">← Back to Startups</Link>
        <div className="flex items-center justify-between mt-3">
          <h1 className="page-heading">{startup.name}</h1>
          <StatusBadge status={startup.status} />
        </div>
        <div className="flex items-center flex-wrap gap-2 mt-2">
          <span className="tag">{startup.industry}</span>
          <span className="tag">{startup.fundingStage}</span>
          <span className="tag">Founder: {startup.founder?.name}</span>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h2 className="section-heading mb-3">About</h2>
        <p className="text-ash text-sm leading-relaxed">{startup.description}</p>
      </div>

      {/* Milestones */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">Milestones</h2>
          <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="btn-primary text-xs py-1.5 px-3">
            + Add Milestone
          </button>
        </div>

        {showMilestoneForm && (
          <form onSubmit={addMilestone} className="mb-4 p-4 rounded-lg bg-raised border border-edge space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Title *</label>
                <input
                  className="input"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Due Date *</label>
                <input
                  type="date"
                  className="input"
                  value={milestoneForm.dueDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })}
                  required
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                className="input w-40"
                value={milestoneForm.priority}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <button type="button" onClick={() => setShowMilestoneForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create</button>
            </div>
          </form>
        )}

        {startup.milestones.length === 0 ? (
          <p className="text-ash text-sm text-center py-6">No milestones yet. Add one to track progress.</p>
        ) : (
          <div className="space-y-2">
            {startup.milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg bg-raised border border-edge">
                <span className={`text-sm mt-0.5 flex-shrink-0 ${
                  m.status === 'COMPLETED' ? 'text-f-green' :
                  m.status === 'IN_PROGRESS' ? 'text-f-blue' : 'text-ash'
                }`}>
                  {m.status === 'COMPLETED' ? '✓' : m.status === 'IN_PROGRESS' ? '◌' : '○'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-chalk text-xs">{m.title}</p>
                  {m.description && <p className="text-xs text-ash mt-0.5">{m.description}</p>}
                  <p className="text-xs text-dim mt-1">
                    Due: {format(new Date(m.dueDate), 'MMM d, yyyy')} · {m.priority}
                  </p>
                </div>
                <select
                  className="input text-xs w-36 py-1.5"
                  value={m.status}
                  onChange={(e) => updateMilestone(m.id, e.target.value)}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evaluation */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-heading">My Evaluation</h2>
          {!myEval && (
            <button onClick={() => setShowFeedbackForm(!showFeedbackForm)} className="btn-primary text-xs py-1.5 px-3">
              Submit Feedback
            </button>
          )}
        </div>

        {myEval ? (
          <div className="p-4 rounded-lg bg-f-green/5 border border-f-green/20">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < myEval.rating ? 'text-f-amber' : 'text-edge'}`}>★</span>
              ))}
            </div>
            <p className="text-sm text-ash leading-relaxed">{myEval.comments}</p>
          </div>
        ) : showFeedbackForm ? (
          <form onSubmit={submitFeedback} className="p-4 rounded-lg bg-raised border border-edge space-y-4">
            <div>
              <label className="label">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: n })}
                    className={`text-2xl transition-colors ${n <= feedbackForm.rating ? 'text-f-amber' : 'text-edge hover:text-ash'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Comments *</label>
              <textarea
                className="input resize-none"
                rows={4}
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                placeholder="Your evaluation..."
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowFeedbackForm(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Submit Feedback</button>
            </div>
          </form>
        ) : (
          <p className="text-ash text-sm text-center py-6">No evaluation submitted yet.</p>
        )}
      </div>
    </div>
  );
}
