import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function FounderMessages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket } = useNotifications();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.get('/messages').then((r) => setConversations(r.data));
  }, []);

  useEffect(() => {
    if (userId) loadConversation(userId);
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('message', (msg) => {
      if (activeUser && (msg.senderId === activeUser.id || msg.receiverId === activeUser.id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off('message');
  }, [socket, activeUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (uid) => {
    const res = await api.get(`/messages/${uid}`);
    setMessages(res.data);
    const conv = conversations.find((c) => c.user.id === uid);
    if (conv) setActiveUser(conv.user);
  };

  const send = async () => {
    if (!text.trim() || !activeUser) return;
    try {
      const res = await api.post('/messages', { receiverId: activeUser.id, content: text });
      setMessages((prev) => [...prev, res.data]);
      setText('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-full -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Sidebar */}
      <div className="w-64 border-r border-edge bg-surface flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-edge">
          <h2 className="font-grotesk font-semibold text-chalk text-sm">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-xs text-ash">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.user.id}
                onClick={() => { setActiveUser(c.user); loadConversation(c.user.id); }}
                className={`w-full text-left px-4 py-3 border-b border-edge transition-colors hover:bg-raised ${activeUser?.id === c.user.id ? 'bg-teal/5 border-l-2 border-l-teal' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-raised border border-edge flex items-center justify-center font-medium text-xs text-chalk flex-shrink-0">
                    {c.user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-chalk truncate">{c.user.name}</p>
                    <p className="text-xs text-ash truncate mt-0.5">{c.lastMessage.content}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-canvas">
        {activeUser ? (
          <>
            <div className="bg-surface border-b border-edge px-5 py-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-raised border border-edge flex items-center justify-center font-medium text-xs text-chalk">
                  {activeUser.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-chalk">{activeUser.name}</p>
                  <p className="text-xs text-ash">{activeUser.role}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    msg.senderId === user.id
                      ? 'bg-teal text-canvas rounded-br-sm'
                      : 'bg-surface border border-edge text-chalk rounded-bl-sm'
                  }`}>
                    <p className="leading-relaxed">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderId === user.id ? 'text-canvas/60' : 'text-ash'}`}>
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="bg-surface border-t border-edge px-5 py-3 flex gap-3 flex-shrink-0">
              <input
                className="input flex-1 text-sm"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type a message..."
              />
              <button onClick={send} className="btn-primary px-5">Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-raised border border-edge flex items-center justify-center mx-auto mb-4">
                <span className="text-ash text-xl">⌨</span>
              </div>
              <p className="text-chalk text-sm font-medium mb-1">No conversation selected</p>
              <p className="text-ash text-xs">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
