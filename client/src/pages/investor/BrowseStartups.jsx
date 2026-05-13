import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

const INDUSTRIES = ['', 'EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-Commerce', 'SaaS', 'AI/ML', 'Logistics', 'Energy', 'Other'];
const STAGES = ['', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'];

export default function BrowseStartups() {
  const [startups, setStartups] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ industry: '', fundingStage: '', search: '' });

  useEffect(() => {
    api.get('/startups').then((r) => { setStartups(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = startups;
    if (filters.industry) res = res.filter((s) => s.industry === filters.industry);
    if (filters.fundingStage) res = res.filter((s) => s.fundingStage === filters.fundingStage);
    if (filters.search) res = res.filter((s) =>
      s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.description.toLowerCase().includes(filters.search.toLowerCase())
    );
    setFiltered(res);
  }, [filters, startups]);

  const avgRating = (s) => s.evaluations?.length
    ? (s.evaluations.reduce((a, e) => a + e.rating, 0) / s.evaluations.length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Deal Flow</p>
        <h1 className="page-heading">Browse Startups</h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Name or description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Industry</label>
            <select className="input" value={filters.industry} onChange={(e) => setFilters({ ...filters, industry: e.target.value })}>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i || 'All Industries'}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Funding Stage</label>
            <select className="input" value={filters.fundingStage} onChange={(e) => setFilters({ ...filters, fundingStage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{s || 'All Stages'}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs text-ash mt-3">
          <span className="text-chalk font-medium">{filtered.length}</span> startup{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="spinner w-6 h-6" /></div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-ash text-sm">No startups match your filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <Link key={s.id} to={`/investor/startups/${s.id}`} className="card block group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-grotesk font-semibold text-chalk group-hover:text-f-violet transition-colors">{s.name}</h3>
                    {avgRating(s) && (
                      <span className="text-xs font-medium text-f-amber">★ {avgRating(s)}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className="tag">{s.industry}</span>
                    <span className="tag text-f-blue border-f-blue/20">{s.fundingStage}</span>
                    {s.location && <span className="tag">⊹ {s.location}</span>}
                  </div>
                  <p className="text-xs text-ash line-clamp-2 leading-relaxed">{s.description}</p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-dim">
                    <span>◌ {s.founder?.name}</span>
                    {s.pitchDeckName && <span>◈ Pitch deck</span>}
                    {s._count?.milestones > 0 && <span>◎ {s._count.milestones} milestones</span>}
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <StatusBadge status={s.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
