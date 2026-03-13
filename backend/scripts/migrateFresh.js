/**
 * scripts/migrateFresh.js
 *
 * Truncates ALL data from every table (resets sequences too).
 * Schema structure is kept intact – only rows are deleted.
 *
 * Usage:  npm run db:fresh
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const { pool, testConnection } = require('../src/config/db')

async function fresh() {
  await testConnection()

  console.log('[migrate:fresh] Truncating all tables...')
  await pool.query(`
    TRUNCATE TABLE
      payments,
      order_item_package_selections,
      package_menu_rule_items,
      package_menu_rules,
      order_items,
      orders,
      menus,
      categories
    RESTART IDENTITY CASCADE
  `)
  console.log('[migrate:fresh] All data cleared ✓')

  await pool.end()
  console.log('[migrate:fresh] Done!')
}

fresh().catch((err) => {
  console.error('[migrate:fresh] Failed:', err.message)
  process.exit(1)
})
