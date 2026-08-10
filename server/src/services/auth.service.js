import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

const sessions = new Map();

export const normalizeUsername = (raw) => String(raw || '').trim().slice(0, 30);

const publicUser = ({ id, username, created_at }) => ({ id, username, created_at });

const createSession = (user) => {
  const token = randomUUID();
  sessions.set(token, { userId: user.id, username: user.username });
  return token;
};

export const login = async (rawUsername, rawPassword) => {
  const username = normalizeUsername(rawUsername);
  const password = String(rawPassword || '');

  if (username.length < 3) {
    throw new ApiError(400, 'Username must be at least 3 characters long');
  }
  if (password.length < 4) {
    throw new ApiError(400, 'Password must be at least 4 characters long');
  }

  // Look for an existing user with the same (username, password) pair.
  const result = await pool.query(
    'SELECT id, username, password, created_at FROM users WHERE username = $1',
    [username]
  );

  const existing = result.rows.find(
    (row) => row.password && bcrypt.compareSync(password, row.password)
  );

  if (existing) {
    return { token: createSession(existing), user: publicUser(existing) };
  }

  // No match -> register a new user. Two different users may share a
  // username as long as their passwords differ.
  const hash = bcrypt.hashSync(password, 10);
  const inserted = await pool.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     ON CONFLICT (username, password) DO NOTHING
     RETURNING id, username, created_at`,
    [username, hash]
  );

  let user = inserted.rows[0];
  if (!user) {
    // Lost a tiny race with a concurrent identical registration -> reuse it.
    const retry = await pool.query(
      'SELECT id, username, password, created_at FROM users WHERE username = $1',
      [username]
    );
    const match = retry.rows.find((row) => bcrypt.compareSync(password, row.password));
    if (!match) {
      throw new ApiError(409, 'Could not register user');
    }
    user = publicUser(match);
  }

  return { token: createSession(user), user };
};

export const getUserByToken = (token) => {
  const session = sessions.get(token);
  return session || null;
};

export const logout = (token) => {
  sessions.delete(token);
};
