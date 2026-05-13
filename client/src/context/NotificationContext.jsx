import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    api.get('/notifications').then((res) => setNotifications(res.data)).catch(() => {});

    const s = io(import.meta.env.VITE_SOCKET_URL || '', { path: '/socket.io' });
    s.on('connect', () => s.emit('join', user.id));
    s.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast(notif.message, { icon: '🔔', duration: 4000 });
    });
    setSocket(s);
    return () => s.disconnect();
  }, [user]);

  const markRead = async (id) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, socket }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
