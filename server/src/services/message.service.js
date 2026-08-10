import { pool } from '../config/db.js';
import { ApiError } from '../middleware/errorHandler.js';

const LIMIT = 100;

export const createMessage = async ({ userId, username, content }) => {
  const trimmed = String(content || '').trim();

  if (!trimmed) {
    throw new ApiError(400, 'Message content cannot be empty');
  }
  if (trimmed.length > 2000) {
    throw new ApiError(400, 'Message content is too long (max 2000 characters)');
  }

  const result = await pool.query(
    `INSERT INTO messages (user_id, username, content)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, username, content, status, created_at`,
    [userId, username, trimmed]
  );

  return result.rows[0];
};

export const getMessages = async ({ limit = LIMIT }) => {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || LIMIT, 1), 500);

  const result = await pool.query(
    `SELECT id, user_id, username, content, status, created_at
     FROM messages
     ORDER BY created_at DESC
     LIMIT $1`,
    [safeLimit]
  );

  return result.rows.reverse();
};

export const markAsRead = async (messageId) => {
  await pool.query(
    `UPDATE messages
     SET status = 'read'
     WHERE id = $1 AND status <> 'read'`,
    [messageId]
  );
};
