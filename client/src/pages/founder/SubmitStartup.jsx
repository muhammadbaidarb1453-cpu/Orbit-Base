import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const INDUSTRIES = ['EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-Commerce', 'SaaS', 'AI/ML', 'Logistics', 'Energy', 'Other'];
const STAGES = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];
const CATEGORIES = ['Education', 'Financial Services', 'Healthcare', 'Agriculture', 'Retail', 'Enterprise Software', 'Consumer', 'Other'];

export default function SubmitStartup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pitchFile, setPitchFile] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', industry: '', fundingStage: '', category: '', location: '', website: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.industry || !form.fundingStage) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/startups', form);
      const startupId = res.data.id;
      if (pitchFile) {
        const fd = new FormData();
        fd.append('pitchDeck', pitchFile);
        await api.post(`/startups/${startupId}/pitch-deck`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast.success('Startup submitted successfully!');
      navigate(`/founder/startup/${startupId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">New Application</p>
        <h1 className="page-heading">Submit Your Startup</h1>
        <p className="text-ash text-sm mt-1">Apply to the incubation program</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card space-y-5">
          <div>
            <label className="label">Startup Name <span className="text-f-red normal-case font-normal">*</span></label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. EduLeap"
              required
            />
          </div>

          <div>
            <label className="label">Description <span className="text-f-red normal-case font-normal">*</span></label>
            <textarea
              className="input min-h-[110px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your startup, the problem it solves, and your solution..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Industry <span className="text-f-red normal-case font-normal">*</span></label>
              <select className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} required>
                <option value="">Select</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Funding Stage <span className="text-f-red normal-case font-normal">*</span></label>
              <select className="input" value={form.fundingStage} onChange={(e) => setForm({ ...form, fundingStage: e.target.value })} required>
                <option value="">Select</option>
                {STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input
                className="input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Lahore, Pakistan"
              />
            </div>
          </div>

          <div>
            <label className="label">Website</label>
            <input
              className="input"
              type="url"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://yourstartup.com"
            />
          </div>
        </div>

        {/* Pitch deck upload */}
        <div className="card">
          <label className="label">
            Pitch Deck
            <span className="text-dim normal-case font-normal ml-1 tracking-normal">(PDF or PPTX, max 50MB)</span>
          </label>
          <input
            type="file"
            accept=".pdf,.pptx"
            onChange={(e) => setPitchFile(e.target.files[0])}
            className="hidden"
            id="pitch-deck"
          />
          <label
            htmlFor="pitch-deck"
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all duration-150 ${
              pitchFile
                ? 'border-teal bg-teal/5'
                : 'border-edge hover:border-edge-hi hover:bg-raised'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${pitchFile ? 'bg-teal/10' : 'bg-raised border border-edge'}`}>
              <span className={`text-lg ${pitchFile ? 'text-teal' : 'text-ash'}`}>◈</span>
            </div>
            {pitchFile ? (
              <p className="text-sm font-semibold text-teal">{pitchFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-ash font-medium">Click to upload pitch deck</p>
                <p className="text-xs text-dim mt-1">PDF or PPTX</p>
              </>
            )}
          </label>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/founder')} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner w-4 h-4" />
                Submitting...
              </span>
            ) : 'Submit Startup'}
          </button>
        </div>
      </form>
    </div>
  );
}
