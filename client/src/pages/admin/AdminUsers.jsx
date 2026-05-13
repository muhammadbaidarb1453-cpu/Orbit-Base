import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const roleBadge = {
  FOUNDER:  'bg-f-blue/10 text-f-blue border border-f-blue/20',
  MENTOR:   'bg-f-green/10 text-f-green border border-f-green/20',
  INVESTOR: 'bg-f-violet/10 text-f-violet border border-f-violet/20',
  ADMIN:    'bg-f-amber/10 text-f-amber border border-f-amber/20',
};

const FILTERS = ['ALL', 'PENDING', 'FOUNDER', 'MENTOR', 'INVESTOR', 'ADMIN'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/admin/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/approve`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isApproved: true } : u));
      toast.success('User approved!');
    } catch { toast.error('Failed to approve user'); }
  };

  const deactivate = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/deactivate`);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: false } : u));
      toast.success('User deactivated');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to change role'); }
  };

  const filtered = filter === 'ALL' ? users
    : filter === 'PENDING' ? users.filter((u) => !u.isApproved && u.role !== 'FOUNDER')
    : users.filter((u) => u.role === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Management</p>
          <h1 className="page-heading">User Management</h1>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 ${
                filter === f
                  ? 'bg-teal text-canvas'
                  : 'bg-raised border border-edge text-ash hover:text-chalk hover:border-edge-hi'
              }`}
            >
              {f === 'PENDING' ? '⚠ Pending' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead className="border-b border-edge">
            <tr>
              {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} className="text-left text-[10px] font-semibold text-ash uppercase tracking-widest px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {filtered.map((u) => (
              <tr key={u.id} className={`hover:bg-raised transition-colors ${!u.isActive ? 'opacity-40' : ''}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-canvas text-xs font-bold flex-shrink-0 ${roleBadge[u.role] ? '' : 'bg-ash'}`}
                      style={{ background: u.role === 'FOUNDER' ? '#5B8EFF' : u.role === 'MENTOR' ? '#34D399' : u.role === 'INVESTOR' ? '#B17AF5' : '#FBBF24' }}>
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-chalk">{u.name}</p>
                      <p className="text-xs text-ash">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <select
                    className={`badge border cursor-pointer bg-transparent text-[11px] ${roleBadge[u.role] || 'bg-raised text-ash border-edge'}`}
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                  >
                    {['FOUNDER', 'MENTOR', 'INVESTOR', 'ADMIN'].map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3">
                  {!u.isActive ? (
                    <span className="badge bg-f-red/10 text-f-red border border-f-red/20 text-[11px]">Inactive</span>
                  ) : u.isApproved ? (
                    <span className="badge bg-f-green/10 text-f-green border border-f-green/20 text-[11px]">Active</span>
                  ) : (
                    <span className="badge bg-f-amber/10 text-f-amber border border-f-amber/20 text-[11px]">Pending</span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-ash">
                  {format(new Date(u.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    {!u.isApproved && u.role !== 'FOUNDER' && (
                      <button
                        onClick={() => approve(u.id)}
                        className="text-xs bg-f-green/10 text-f-green border border-f-green/20 hover:bg-f-green/20 px-2 py-1 rounded-lg transition-colors font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {u.isActive && (
                      <button
                        onClick={() => deactivate(u.id)}
                        className="text-xs bg-f-red/10 text-f-red border border-f-red/20 hover:bg-f-red/20 px-2 py-1 rounded-lg transition-colors font-semibold"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-ash text-sm">No users found.</p>
        )}
      </div>
    </div>
  );
}
