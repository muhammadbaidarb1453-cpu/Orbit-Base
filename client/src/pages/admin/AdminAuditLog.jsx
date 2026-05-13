import { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';

const actionMeta = {
  APPROVE_USER:    { label: 'User Approved',  color: 'bg-f-green/10 text-f-green border border-f-green/20',    dot: 'bg-f-green' },
  DEACTIVATE_USER: { label: 'User Deactivated', color: 'bg-f-red/10 text-f-red border border-f-red/20',       dot: 'bg-f-red' },
  CHANGE_ROLE:     { label: 'Role Changed',   color: 'bg-f-blue/10 text-f-blue border border-f-blue/20',      dot: 'bg-f-blue' },
  STATUS_CHANGE:   { label: 'Status Changed', color: 'bg-f-violet/10 text-f-violet border border-f-violet/20', dot: 'bg-f-violet' },
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/audit-logs').then((r) => setLogs(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="spinner w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-widest mb-1">Activity</p>
        <h1 className="page-heading">Audit Log</h1>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="divide-y divide-edge">
          {logs.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-ash text-sm">No audit logs yet.</p>
            </div>
          ) : (
            logs.map((log) => {
              const meta = actionMeta[log.action] || { label: log.action, color: 'bg-raised text-ash border border-edge', dot: 'bg-ash' };
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-raised transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${meta.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`badge text-[11px] ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-ash">by {log.admin?.name}</span>
                    </div>
                    <p className="text-xs text-chalk">{log.details}</p>
                  </div>
                  <p className="text-xs text-dim whitespace-nowrap flex-shrink-0">
                    {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
