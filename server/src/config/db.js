import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const connectionConfig = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
    };

export const pool = new Pool({
  ...connectionConfig,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected error on idle client', err.message);
});
