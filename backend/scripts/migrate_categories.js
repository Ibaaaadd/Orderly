require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const { query } = require('../src/config/db')

async function run() {
  await query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_key  VARCHAR(50) NOT NULL DEFAULT 'tag'`)
  await query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS color_key VARCHAR(50) NOT NULL DEFAULT 'primary'`)
  console.log('Columns ensured: icon_key, color_key')

  const backfill = [
    { name: 'Makanan', icon_key: 'utensils',    color_key: 'primary' },
    { name: 'Minuman', icon_key: 'glass-water', color_key: 'sky'     },
    { name: 'Snack',   icon_key: 'cookie',      color_key: 'amber'   },
    { name: 'Kopi',    icon_key: 'coffee',      color_key: 'orange'  },
    { name: 'Pizza',   icon_key: 'pizza',        color_key: 'rose'    },
  ]
  for (const row of backfill) {
    await query(
      `UPDATE categories SET icon_key = $1, color_key = $2 WHERE LOWER(name) = LOWER($3) AND icon_key = 'tag'`,
      [row.icon_key, row.color_key, row.name]
    )
  }

  const result = await query('SELECT id, name, icon_key, color_key FROM categories ORDER BY id')
  console.table(result.rows)
  console.log('Migration done.')
  process.exit(0)
}

run().catch((e) => { console.error(e.message); process.exit(1) })
