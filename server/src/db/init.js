import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';
import { env } from '../config/env.js';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const buildClient = ({ database } = {}) =>
  new Client(
    env.databaseUrl
      ? {
          connectionString: env.databaseUrl,
          ssl: { rejectUnauthorized: false },
        }
      : {
          host: env.db.host,
          port: env.db.port,
          user: env.db.user,
          password: env.db.password,
          database: database ?? env.db.database,
        }
  );

async function ensureDatabase() {
  // On managed hosts (Render, Neon, …) the database is provisioned already.
  if (env.databaseUrl) {
    console.log('[db] Using provided DATABASE_URL (managed database)');
    return;
  }

  const maintenance = buildClient({ database: 'postgres' });
  try {
    await maintenance.connect();
    const { rowCount } = await maintenance.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [env.db.database]
    );
    if (rowCount === 0) {
      await maintenance.query(`CREATE DATABASE "${env.db.database}"`);
      console.log(`[db] Created database "${env.db.database}"`);
    } else {
      console.log(`[db] Database "${env.db.database}" already exists`);
    }
  } catch (err) {
    console.warn(`[db] Could not auto-create database: ${err.message}`);
  } finally {
    await maintenance.end();
  }
}

async function runSchema() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');

  const client = buildClient();
  await client.connect();
  try {
    await client.query(schema);
    console.log('[db] Schema applied');
  } finally {
    await client.end();
  }
}

await ensureDatabase();
await runSchema();
