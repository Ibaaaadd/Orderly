const { query } = require('../config/db')

async function findAll() {
  const sql = `
    SELECT id, username, full_name, role, is_active, created_at, updated_at
    FROM users
    ORDER BY id ASC
  `
  const result = await query(sql)
  return result.rows
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

async function create({ username, password_hash, full_name, role, is_active }) {
  const sql = `
    INSERT INTO users (username, password_hash, full_name, role, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, username, full_name, role, is_active, created_at, updated_at
  `
  const result = await query(sql, [username, password_hash, full_name, role, is_active])
  return result.rows[0]
}

async function update(id, { username, full_name, role, is_active, password_hash }) {
  const fields = []
  const values = []
  let idx = 1

  if (username !== undefined) {
    fields.push(`username = $${idx++}`)
    values.push(username)
  }
  if (full_name !== undefined) {
    fields.push(`full_name = $${idx++}`)
    values.push(full_name)
  }
  if (role !== undefined) {
    fields.push(`role = $${idx++}`)
    values.push(role)
  }
  if (is_active !== undefined) {
    fields.push(`is_active = $${idx++}`)
    values.push(is_active)
  }
  if (password_hash !== undefined) {
    fields.push(`password_hash = $${idx++}`)
    values.push(password_hash)
  }

  if (!fields.length) {
    return findById(id)
  }

  fields.push('updated_at = NOW()')
  values.push(id)

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${idx}
    RETURNING id, username, full_name, role, is_active, created_at, updated_at
  `

  const result = await query(sql, values)
  return result.rows[0] || null
}

async function remove(id) {
  const sql = `DELETE FROM users WHERE id = $1 RETURNING id`
  const result = await query(sql, [id])
  return result.rows[0] || null
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
}
