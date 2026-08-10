const API_URL = `${import.meta.env.VITE_API_URL || ''}/api`;

const request = async (path, { token, ...options } = {}) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const logout = (token) =>
  request('/auth/logout', { method: 'POST', token });

export const fetchMessages = (token, limit = 100) =>
  request(`/messages?limit=${limit}`, { token });
