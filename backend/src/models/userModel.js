const { query } = require('../config/db')

async function findByUsername(username) {
  const sql = `
    SELECT id, username, password_hash, full_name, role, is_active, created_at, updated_at
    FROM users
    WHERE username = $1
    LIMIT 1
  `
  const result = await query(sql, [username])
  return result.rows[0] || null
}

async function findById(id) {
  const sql = `
    SELECT id, username, full_name, role, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `
  const result = await query(sql, [id])
  return result.rows[0] || null
}

module.exports = {
  findByUsername,
  findById,
}
