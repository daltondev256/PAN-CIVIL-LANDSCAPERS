const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    })
  : null;

let schemaReady;

async function ensureSchema() {
  if (!pool) throw new Error('DATABASE_URL is not configured.');
  if (!schemaReady) {
    schemaReady = pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(50),
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS quotes (
        id BIGSERIAL PRIMARY KEY,
        client_name VARCHAR(160) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        service_type VARCHAR(120) NOT NULL,
        property_type VARCHAR(120),
        preferred_date VARCHAR(40),
        status VARCHAR(40) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS admin_sessions (
        token_hash CHAR(64) PRIMARY KEY,
        admin_email VARCHAR(254) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON inquiries (created_at DESC);
      CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes (created_at DESC);
      CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx ON admin_sessions (expires_at);
    `).catch(error => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

async function query(sql, params = []) {
  await ensureSchema();
  return pool.query(sql, params);
}

module.exports = { query, ensureSchema, pool };
