import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, currentUser, typingUsers, loading }) => {
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typingUsers.length]);

  if (loading) {
    return (
      <div className="messages-empty">
        <div className="spinner" />
        <p>Loading messages…</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="messages-empty">
        <div className="empty-bubble">👋</div>
        <h3>No messages yet</h3>
        <p>Say hello to start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list" ref={scrollRef} onScroll={handleScroll}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.username === currentUser}
        />
      ))}
      <TypingIndicator users={typingUsers} />
    </div>
  );
};

export default MessageList;
