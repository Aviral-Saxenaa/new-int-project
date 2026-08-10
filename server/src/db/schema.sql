CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(30) NOT NULL,
  password      TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username      VARCHAR(30) NOT NULL,
  content       TEXT NOT NULL,
  status        VARCHAR(20) NOT NULL DEFAULT 'sent',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);

-- Identity is the (username, password) pair:
-- the same username may exist with different passwords,
-- but each pair stays unique.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_password ON users (username, password);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
