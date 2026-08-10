import { login, logout } from '../services/auth.service.js';

export const loginUser = async (req, res) => {
  const { token, user } = await login(req.body?.username, req.body?.password);
  res.json({ success: true, token, user });
};

export const logoutUser = (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) logout(token);
  res.json({ success: true });
};
