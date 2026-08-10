import { initial } from '../utils/formatTime';

const TypingIndicator = ({ users }) => {
  if (users.length === 0) return null;

  const names = users.length > 2 ? `${users.slice(0, 2).join(', ')} and others` : users.join(' and ');

  return (
    <div className="typing-row">
      <div className="avatar typing-avatar">{initial(users[0])}</div>
      <div className="typing-bubble">
        <span className="typing-dots">
          <span />
          <span />
          <span />
        </span>
        <span className="typing-text">{names} is typing…</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
