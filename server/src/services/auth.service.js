import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

const sessions = new Map();

export const normalizeUsername = (raw) => String(raw || '').trim().slice(0, 30);

export const login = async (rawUsername) => {
  const username = normalizeUsername(rawUsername);

  if (username.length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters long');
  }

  const result = await pool.query(
    `INSERT INTO users (username)
     VALUES ($1)
     ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
     RETURNING id, username, created_at`,
    [username]
  );

  const user = result.rows[0];
  const token = randomUUID();
  sessions.set(token, { userId: user.id, username: user.username });

  return { token, user };
};

export const getUserByToken = (token) => {
  const session = sessions.get(token);
  return session || null;
};

export const logout = (token) => {
  sessions.delete(token);
};
