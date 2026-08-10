import { formatTimestamp, initial } from '../utils/formatTime';
import StatusBadge from './MessageStatus';

const MessageBubble = ({ message, isOwn }) => {
  const { username, content, status } = message;

  return (
    <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && <div className="avatar">{initial(username)}</div>}
      <div className="message-body">
        {!isOwn && <div className="message-username">{username}</div>}
        <div className="message-bubble">
          <p className="message-content">{content}</p>
          <div className="message-meta">
            <span className="message-time">{formatTimestamp(message.created_at)}</span>
            {isOwn && <StatusBadge status={status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
