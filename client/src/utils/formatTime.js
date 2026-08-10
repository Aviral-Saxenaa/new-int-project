export const formatTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatTimestamp = (iso) => {
  const date = new Date(iso);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return formatTime(iso);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${formatTime(iso)}`;
  }

  const day = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `${day}, ${formatTime(iso)}`;
};

export const initial = (username) => (username || '?').charAt(0).toUpperCase();
