import pg from 'pg';
import { env } from '../config/env.js';
import { applySchema } from './schema.js';

const { Client } = pg;

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

await ensureDatabase();
await applySchema();
