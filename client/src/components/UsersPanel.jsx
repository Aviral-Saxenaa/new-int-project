import { initial } from '../utils/formatTime';

const UsersPanel = ({ users, currentUser, connection, onLogout }) => {
  const onlineCount = users.length;

  return (
    <aside className="users-panel">
      <div className="panel-header">
        <div className="brand">
          <span className="brand-badge">💬</span>
          <div>
            <h1 className="brand-name">Chatify</h1>
            <p className="brand-tagline">Real-time chat</p>
          </div>
        </div>
      </div>

      <div className="me-card">
        <div className="avatar me-avatar">{initial(currentUser)}</div>
        <div className="me-info">
          <span className="me-name">{currentUser}</span>
          <span className="me-status">
            <span className={`conn-dot ${connection}`} />
            {connection === 'connected' ? 'Online' : connection === 'connecting' ? 'Connecting…' : 'Offline'}
          </span>
        </div>
        <button className="logout-button" onClick={onLogout} title="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 12H4m0 0 3.5-3.5M4 12l3.5 3.5M9 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="online-section">
        <div className="online-heading">
          <span>Online — {onlineCount}</span>
          <span className="online-pulse" />
        </div>
        {onlineCount === 0 ? (
          <p className="no-users">No one is online right now</p>
        ) : (
          <ul className="online-list">
            {users.map((user) => (
              <li key={user.socketId} className="online-item">
                <span className="avatar small-avatar">{initial(user.username)}</span>
                <span className="online-name">
                  {user.username}
                  {user.username === currentUser && <span className="you-badge">you</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default UsersPanel;
