/**
 * scripts/setupDb.js
 *
 * Convenience script: creates the database schema and seeds initial data.
 * Run with: npm run db:setup
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const fs   = require('fs')
const path = require('path')
const { pool, testConnection } = require('../src/config/db')

async function setup() {
  await testConnection()

  const schema = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8')
  const seed   = fs.readFileSync(path.join(__dirname, '../database/seed.sql'),   'utf8')

  console.log('[Setup] Running schema...')
  await pool.query(schema)
  console.log('[Setup] Schema applied ✓')

  console.log('[Setup] Running seed...')
  await pool.query(seed)
  console.log('[Setup] Seed data inserted ✓')

  await pool.end()
  console.log('[Setup] Done!')
}

setup().catch((err) => {
  console.error('[Setup] Failed:', err.message)
  process.exit(1)
})
