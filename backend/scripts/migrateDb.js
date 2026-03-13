/**
 * scripts/migrateDb.js
 *
 * Drops all existing tables then recreates them from schema.sql.
 * Does NOT insert any seed data – run seed.sql manually if needed.
 *
 * Usage:  npm run db:migrate
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const fs   = require('fs')
const path = require('path')
const { pool, testConnection } = require('../src/config/db')

async function migrate() {
  await testConnection()

  const schema = fs.readFileSync(
    path.join(__dirname, '../database/schema.sql'),
    'utf8'
  )

  console.log('[migrate:db] Dropping tables and applying schema...')
  await pool.query(schema)
  console.log('[migrate:db] Schema applied ✓')

  await pool.end()
  console.log('[migrate:db] Done!')
}

migrate().catch((err) => {
  console.error('[migrate:db] Failed:', err.message)
  process.exit(1)
})
