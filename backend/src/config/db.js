const { Pool } = require('pg')

/**
 * PostgreSQL connection pool.
 * Reads config from environment variables.
 */
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME     || 'orderly',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max:      10,         // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error', err)
})

/**
 * Utility: run a raw SQL query.
 * @param {string}  text   – parameterised SQL
 * @param {Array}   params – query params
 */
async function query(text, params) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DB]', { text: text.slice(0, 80), duration, rows: res.rowCount })
  }
  return res
}

/** Test the connection at startup */
async function testConnection() {
  try {
    await pool.query('SELECT 1')
    console.log('[DB] PostgreSQL connected ✓')
  } catch (err) {
    console.error('[DB] Connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = { pool, query, testConnection }
