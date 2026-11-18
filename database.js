const { Pool } = require('pg');

function normalizeDatabaseUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    const sslMode = (url.searchParams.get('sslmode') || '').toLowerCase();
    // Preserve the driver's existing secure behavior while avoiding legacy-mode warnings.
    if (['prefer', 'require', 'verify-ca'].includes(sslMode)) {
      url.searchParams.set('sslmode', 'verify-full');
    }
    return url.toString();
  } catch {
    return value;
  }
}

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),
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

      CREATE TABLE IF NOT EXISTS customers (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(160) NOT NULL,
        email VARCHAR(254) NOT NULL UNIQUE,
        phone VARCHAR(50),
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS customer_sessions (
        token_hash CHAR(64) PRIMARY KEY,
        customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;
      ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS customer_sessions_customer_idx ON customer_sessions (customer_id);
      CREATE INDEX IF NOT EXISTS customer_sessions_expires_at_idx ON customer_sessions (expires_at);
      CREATE INDEX IF NOT EXISTS inquiries_customer_idx ON inquiries (customer_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS quotes_customer_idx ON quotes (customer_id, created_at DESC);

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
