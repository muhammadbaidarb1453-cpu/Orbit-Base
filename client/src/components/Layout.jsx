import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useState } from 'react';
import NotificationPanel from './NotificationPanel';

const navByRole = {
  FOUNDER: [
    { to: '/founder', label: 'Dashboard', icon: '◈', end: true },
    { to: '/founder/submit', label: 'Submit Startup', icon: '↑' },
    { to: '/founder/mentors', label: 'Find Mentors', icon: '⟡' },
    { to: '/founder/meetings', label: 'Meetings', icon: '◷' },
    { to: '/founder/messages', label: 'Messages', icon: '⌨' },
  ],
  MENTOR: [
    { to: '/mentor', label: 'Dashboard', icon: '◈', end: true },
    { to: '/mentor/startups', label: 'My Startups', icon: '⊹' },
    { to: '/mentor/requests', label: 'Requests', icon: '◌' },
  ],
  INVESTOR: [
    { to: '/investor', label: 'Dashboard', icon: '◈', end: true },
    { to: '/investor/startups', label: 'Browse Startups', icon: '⊹' },
    { to: '/investor/meetings', label: 'Meetings', icon: '◷' },
    { to: '/investor/messages', label: 'Messages', icon: '⌨' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: '◈', end: true },
    { to: '/admin/users', label: 'Users', icon: '⊚' },
    { to: '/admin/startups', label: 'Startups', icon: '⊹' },
    { to: '/admin/audit', label: 'Audit Log', icon: '≡' },
  ],
};

const roleConfig = {
  FOUNDER:  { color: 'text-f-blue',   dot: 'bg-f-blue',   label: 'Founder' },
  MENTOR:   { color: 'text-f-green',  dot: 'bg-f-green',  label: 'Mentor' },
  INVESTOR: { color: 'text-f-violet', dot: 'bg-f-violet', label: 'Investor' },
  ADMIN:    { color: 'text-f-amber',  dot: 'bg-f-amber',  label: 'Admin' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const navItems = navByRole[user?.role] || [];
  const role = roleConfig[user?.role] || {};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="w-56 bg-surface border-r border-edge flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-edge">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center flex-shrink-0">
              <span className="text-canvas font-bold font-grotesk text-sm">O</span>
            </div>
            <span className="font-grotesk font-bold text-chalk text-base tracking-tight">OrbitBase</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
            <span className={`text-xs font-semibold ${role.color} uppercase tracking-wider`}>{role.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link-base ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <span className="text-base leading-none w-4 text-center flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-edge">
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-canvas text-xs font-bold flex-shrink-0 ${role.dot}`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-chalk truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-ash truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-ash hover:text-f-red transition-colors px-1 py-0.5"
          >
            Sign out →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-12 bg-surface border-b border-edge flex items-center justify-end px-5 gap-3 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-1.5 text-ash hover:text-chalk hover:bg-raised rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-f-red text-canvas text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
          </div>
          <div className="text-xs text-ash">
            <span className="text-chalk font-medium">{user?.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
