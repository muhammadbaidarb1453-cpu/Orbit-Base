import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const typeColors = {
  STATUS_UPDATE:       'text-f-blue',
  MESSAGE:             'text-teal',
  MEETING:             'text-f-violet',
  MEETING_CONFIRMED:   'text-f-green',
  MENTORSHIP_REQUEST:  'text-f-amber',
  MENTORSHIP_UPDATE:   'text-f-amber',
  EVALUATION:          'text-f-amber',
  MILESTONE:           'text-teal',
  MILESTONE_UPDATE:    'text-teal',
  ACCOUNT_APPROVED:    'text-f-green',
};

const typeDot = {
  STATUS_UPDATE:       'bg-f-blue',
  MESSAGE:             'bg-teal',
  MEETING:             'bg-f-violet',
  MEETING_CONFIRMED:   'bg-f-green',
  MENTORSHIP_REQUEST:  'bg-f-amber',
  MENTORSHIP_UPDATE:   'bg-f-amber',
  EVALUATION:          'bg-f-amber',
  MILESTONE:           'bg-teal',
  MILESTONE_UPDATE:    'bg-teal',
  ACCOUNT_APPROVED:    'bg-f-green',
};

export default function NotificationPanel({ onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications();

  return (
    <div className="absolute right-0 top-10 w-80 bg-surface rounded-xl shadow-2xl border border-edge z-50"
         style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge">
        <h3 className="font-grotesk font-semibold text-chalk text-sm">Notifications</h3>
        <button
          onClick={markAllRead}
          className="text-xs text-ash hover:text-teal transition-colors"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-edge">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-dim text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-3 p-3 cursor-pointer hover:bg-raised transition-colors ${!n.read ? 'bg-teal/5' : ''}`}
            >
              <div className="flex-shrink-0 mt-1">
                <span className={`w-2 h-2 rounded-full inline-block ${typeDot[n.type] || 'bg-ash'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-chalk leading-tight">{n.title}</p>
                <p className="text-xs text-ash mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-dim mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 py-2 border-t border-edge">
        <button
          onClick={onClose}
          className="w-full text-xs text-ash hover:text-chalk transition-colors py-1"
        >
          Close
        </button>
      </div>
    </div>
  );
}
