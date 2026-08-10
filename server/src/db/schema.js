import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from '../config/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// The schema is fully idempotent (IF NOT EXISTS / IF EXISTS guards),
// so it is safe to run on every server start.
export const applySchema = async () => {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
};
