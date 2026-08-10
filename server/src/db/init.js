import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';
import { env } from '../config/env.js';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function ensureDatabase() {
  const maintenance = new Client({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: 'postgres',
  });

  await maintenance.connect();
  try {
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
  } finally {
    await maintenance.end();
  }
}

async function runSchema() {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');

  const client = new Client({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  });

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
