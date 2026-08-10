import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createSocket } from '../services/socket';
import { fetchMessages } from '../services/api';
import UsersPanel from './UsersPanel';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const randomId = () => (crypto?.randomUUID ? crypto.randomUUID() : `tmp-${Date.now()}`);

const ChatWindow = () => {
  const { session, signOut } = useAuth();
  const me = session.user;

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState('connecting');
  const [toast, setToast] = useState(null);

  const socketRef = useRef(null);
  const typingTimer = useRef(null);
  const typingActive = useRef(false);

  const showToast = useCallback((type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchMessages(session.token);
      setMessages(data.messages);
    } catch {
      showToast('error', 'Failed to load chat history. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [session.token, showToast]);

  useEffect(() => {
    const socket = createSocket(session.token, me.username);
    socketRef.current = socket;
    setConnection('connecting');
    setLoading(true);

    socket.on('connect', () => {
      setConnection('connected');
      loadHistory();
    });

    socket.on('connect_error', () => setConnection('disconnected'));
    socket.on('disconnect', () => setConnection('disconnected'));

    socket.on('users:online', setOnlineUsers);
    socket.on('typing:users', setTypingUsers);

    socket.on('message:ack', ({ tempId, message }) => {
      setMessages((prev) =>
        prev.map((m) => (m.tempId === tempId ? { ...message, tempId } : m))
      );
    });

    socket.on('message:new', (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      if (document.visibilityState === 'visible') {
        socket.emit('message:read', { messageId: message.id });
      }
    });

    socket.on('message:status', ({ id, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    });

    socket.on('error', ({ message, tempId }) => {
      if (tempId) {
        setMessages((prev) => prev.map((m) => (m.tempId === tempId ? { ...m, status: 'failed' } : m)));
      }
      showToast('error', message || 'Connection error');
    });

    return () => socket.disconnect();
  }, [session.token, me, loadHistory, showToast]);

  const handleSend = useCallback(
    (content) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        showToast('error', 'You are offline. Reconnecting…');
        return;
      }

      const tempId = randomId();
      const optimistic = {
        id: tempId,
        tempId,
        user_id: me.id,
        username: me.username,
        content,
        status: 'sending',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);
      socket.emit('message:send', { tempId, content });
    },
    [me, showToast]
  );
  const emitTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    if (!typingActive.current) {
      typingActive.current = true;
      socket.emit('typing:start');
      typingTimer.current = setTimeout(() => {
        typingActive.current = false;
      }, 2000);
    }
  }, []);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current);
    typingActive.current = false;
    socketRef.current?.emit('typing:stop');
  }, []);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  const connected = connection === 'connected';

  return (
    <div className="chat-layout">
      <UsersPanel
        users={onlineUsers}
        currentUser={me.username}
        connection={connection}
        onLogout={signOut}
      />

      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-title">
            <span className="avatar header-avatar">{me.username.charAt(0).toUpperCase()}</span>
            <div>
              <h2 className="chat-room">General Room</h2>
              <p className="chat-subtitle">
                {connected ? `${onlineUsers.length} online` : 'Reconnecting…'}
              </p>
            </div>
          </div>
        </header>

        <MessageList
          messages={messages}
          me={me}
          typingUsers={typingUsers}
          loading={loading}
        />

        <MessageInput
          onSend={handleSend}
          onType={emitTyping}
          onBlur={stopTyping}
          disabled={!connected}
        />

        {toast && (
          <div className={`toast ${toast.type}`}>
            <span>{toast.text}</span>
            <button onClick={() => setToast(null)} aria-label="Dismiss">✕</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatWindow;
