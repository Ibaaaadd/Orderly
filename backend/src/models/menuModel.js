const { query } = require('../config/db')

/**
 * Menu model – raw SQL queries for the menus table.
 */
const menuModel = {
  /** Get all menus, optionally filtered by category */
  findAll: async ({ category_id } = {}) => {
    const params = []
    let sql = `
      SELECT
        m.id, m.name, m.price, m.image_url, m.is_available,
        c.id AS category_id, c.name AS category_name
      FROM menus m
      LEFT JOIN categories c ON c.id = m.category_id
      WHERE 1=1
    `
    if (category_id) {
      params.push(category_id)
      sql += ` AND m.category_id = $${params.length}`
    }
    sql += ' ORDER BY m.id ASC'
    const res = await query(sql, params)
    return res.rows
  },

  /** Find a single menu by id */
  findById: async (id) => {
    const res = await query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    )
    return res.rows[0] || null
  },

  /** Create a new menu item */
  create: async ({ category_id, name, price, image_url, is_available }) => {
    const res = await query(
      `INSERT INTO menus (category_id, name, price, image_url, is_available)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category_id || null, name, price, image_url || null, is_available !== false]
    )
    return res.rows[0]
  },

  /** Update an existing menu item (only provided fields) */
  update: async (id, { category_id, name, price, image_url, is_available }) => {
    const fields = []
    const values = []
    let idx = 1

    if (category_id  !== undefined) { fields.push(`category_id = $${idx++}`)  ; values.push(category_id)  }
    if (name         !== undefined) { fields.push(`name = $${idx++}`)         ; values.push(name)         }
    if (price        !== undefined) { fields.push(`price = $${idx++}`)        ; values.push(price)        }
    if (image_url    !== undefined) { fields.push(`image_url = $${idx++}`)    ; values.push(image_url)    }
    if (is_available !== undefined) { fields.push(`is_available = $${idx++}`) ; values.push(is_available) }

    if (!fields.length) return menuModel.findById(id)

    values.push(id)
    const res = await query(
      `UPDATE menus SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return res.rows[0] || null
  },

  /** Delete a menu item */
  delete: async (id) => {
    const res = await query(
      'DELETE FROM menus WHERE id = $1 RETURNING id',
      [id]
    )
    return res.rows[0] || null
  },
}

module.exports = menuModel
