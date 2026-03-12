const { query } = require('../config/db')

/**
 * Menu model – raw SQL queries for the menus table.
 */
const menuModel = {
  /** Get menus with optional filter, search and pagination — returns { rows, total } */
  findAll: async ({ category_id, search, page = 1, limit = 10 } = {}) => {
    const whereParams = []
    let where = ''

    if (category_id) {
      whereParams.push(category_id)
      where += ` AND m.category_id = $${whereParams.length}`
    }
    if (search) {
      whereParams.push(`%${search}%`)
      where += ` AND (m.name ILIKE $${whereParams.length} OR c.name ILIKE $${whereParams.length})`
    }

    const countRes = await query(
      `SELECT COUNT(*) FROM menus m LEFT JOIN categories c ON c.id = m.category_id WHERE m.deleted_at IS NULL${where}`,
      whereParams
    )
    const total = parseInt(countRes.rows[0].count, 10)

    const offset = (page - 1) * limit
    const dataRes = await query(
      `SELECT m.id, m.name, m.price, m.image_url, m.is_available, m.levels,
              c.id AS category_id, c.name AS category_name
         FROM menus m
         LEFT JOIN categories c ON c.id = m.category_id
        WHERE m.deleted_at IS NULL${where}
        ORDER BY m.id ASC
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`,
      [...whereParams, limit, offset]
    )
    return { rows: dataRes.rows, total }
  },

  /** Find a single active (not deleted) menu by id */
  findById: async (id) => {
    const res = await query(
      'SELECT * FROM menus WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )
    return res.rows[0] || null
  },

  /** Find a menu by id regardless of deleted state (for internal/history use) */
  findByIdAny: async (id) => {
    const res = await query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    )
    return res.rows[0] || null
  },

  /** Create a new menu item */
  create: async ({ category_id, name, price, image_url, is_available, levels }) => {
    const res = await query(
      `INSERT INTO menus (category_id, name, price, image_url, is_available, levels)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [category_id || null, name, price, image_url || null, is_available !== false, JSON.stringify(levels || [])]
    )
    return res.rows[0]
  },

  /** Update an existing menu item (only provided fields) */
  update: async (id, { category_id, name, price, image_url, is_available, levels }) => {
    const fields = []
    const values = []
    let idx = 1

    if (category_id  !== undefined) { fields.push(`category_id = $${idx++}`)  ; values.push(category_id)  }
    if (name         !== undefined) { fields.push(`name = $${idx++}`)         ; values.push(name)         }
    if (price        !== undefined) { fields.push(`price = $${idx++}`)        ; values.push(price)        }
    if (image_url    !== undefined) { fields.push(`image_url = $${idx++}`)    ; values.push(image_url)    }
    if (is_available !== undefined) { fields.push(`is_available = $${idx++}`) ; values.push(is_available) }
    if (levels       !== undefined) { fields.push(`levels = $${idx++}`)       ; values.push(JSON.stringify(levels)) }

    if (!fields.length) return menuModel.findById(id)

    values.push(id)
    const res = await query(
      `UPDATE menus SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return res.rows[0] || null
  },

  /** Soft-delete a menu item (sets deleted_at, preserves historical order data) */
  delete: async (id) => {
    const res = await query(
      'UPDATE menus SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    )
    return res.rows[0] || null
  },
}

module.exports = menuModel
