import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function BrowseMentors() {
  const [mentors, setMentors] = useState([]);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([api.get('/mentors'), api.get('/startups')])
      .then(([m, s]) => {
        setMentors(m.data);
        setStartups(s.data);
        if (s.data[0]) setSelectedStartup(s.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const sendRequest = async (mentorId) => {
    if (!selectedStartup) return toast.error('Please select a startup first');
    try {
      await api.post('/mentors/request', { mentorId, startupId: selectedStartup, message });
      toast.success('Mentorship request sent!');
      setRequesting(null);
      setMessage('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send request');
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
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Network</p>
        <h1 className="page-heading">Browse Mentors</h1>
        <p className="text-ash text-sm mt-1">Find an experienced mentor to guide your startup</p>
      </div>

      {startups.length > 0 && (
        <div className="card">
          <label className="label">Request mentorship for</label>
          <select
            className="input max-w-xs"
            value={selectedStartup}
            onChange={(e) => setSelectedStartup(e.target.value)}
          >
            {startups.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {mentors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-dim text-sm">No mentors available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="card">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-full bg-f-green/10 border border-f-green/20 flex items-center justify-center font-grotesk font-bold text-f-green flex-shrink-0">
                  {mentor.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-grotesk font-semibold text-chalk text-sm">{mentor.name}</h3>
                  <p className="text-xs text-ash mt-1 line-clamp-3 leading-relaxed">
                    {mentor.bio || 'Experienced mentor ready to guide your startup journey.'}
                  </p>
                </div>
              </div>

              {requesting === mentor.id ? (
                <div className="space-y-3 pt-3 border-t border-edge">
                  <textarea
                    className="input text-xs resize-none"
                    placeholder="Optional message to the mentor..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setRequesting(null)} className="btn-secondary flex-1 py-1.5 text-xs">Cancel</button>
                    <button onClick={() => sendRequest(mentor.id)} className="btn-primary flex-1 py-1.5 text-xs">Send Request</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setRequesting(mentor.id)}
                  disabled={!selectedStartup}
                  className="btn-primary w-full text-xs py-2"
                >
                  Request Mentorship
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
