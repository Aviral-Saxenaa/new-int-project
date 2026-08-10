const DoubleTick = ({ color }) => (
  <svg className="status-icon" width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
    <path
      d="M1 6.5 4.5 10 11 2.5"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 6.5 9.5 10 16 2.5"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StatusBadge = ({ status }) => {
  if (status === 'sending') {
    return <span className="msg-status sending">Sending…</span>;
  }

  if (status === 'failed') {
    return <span className="msg-status failed">Failed</span>;
  }

  if (status === 'read') {
    return (
      <span className="msg-status" title="Read">
        <DoubleTick color="#4fc3f7" />
      </span>
    );
  }

  return (
    <span className="msg-status" title="Delivered">
      <DoubleTick color="#94a3b8" />
    </span>
  );
};

export default StatusBadge;
