const { query, pool } = require('../config/db')

/**
 * Order model – raw SQL queries for orders & order_items tables.
 */
const orderModel = {
  /** Create order + items in a single transaction */
  create: async ({ customer_name, customer_phone, customer_email, table_number, order_type, total_price, browser_id, items }) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert order
      const orderRes = await client.query(
        `INSERT INTO orders (customer_name, customer_phone, customer_email, table_number, order_type, total_price, status, browser_id)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
         RETURNING *`,
        [customer_name, customer_phone || null, customer_email || null, table_number || null, order_type || 'dine_in', total_price, browser_id || null]
      )
      const order = orderRes.rows[0]

      // Insert items
      for (const item of items) {
        const itemRes = await client.query(
          `INSERT INTO order_items (order_id, menu_id, menu_name, price, qty, subtotal, level)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [order.id, item.menu_id, item.menu_name || null, item.price, item.qty, item.subtotal, item.level || null]
        )

        const orderItemId = itemRes.rows[0].id
        const selections = Array.isArray(item.package_selections) ? item.package_selections : []
        for (const selection of selections) {
          await client.query(
            `INSERT INTO order_item_package_selections (
               order_item_id,
               package_menu_rule_id,
               selected_menu_id,
               selected_menu_name,
               selected_level,
               qty
             )
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              orderItemId,
              selection.package_menu_rule_id || null,
              selection.selected_menu_id || null,
              selection.selected_menu_name || null,
              selection.selected_level || null,
              selection.qty,
            ]
          )
        }
      }

      await client.query('COMMIT')
      return order
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  /** Find order by id, including its items */
  findById: async (id) => {
    const orderRes = await query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    if (!orderRes.rows[0]) return null

    const order = orderRes.rows[0]

    // Fetch items with menu names (snapshot first, then live name, then fallback)
    const itemsRes = await query(
      `SELECT oi.*,
              COALESCE(oi.menu_name, m.name, 'Menu Dihapus') AS name,
              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', ops.id,
                      'package_menu_rule_id', ops.package_menu_rule_id,
                      'menu_id', ops.selected_menu_id,
                      'menu_name', COALESCE(ops.selected_menu_name, sm.name, 'Menu Dihapus'),
                      'selected_level', ops.selected_level,
                      'qty', ops.qty
                    ) ORDER BY ops.id
                  )
                  FROM order_item_package_selections ops
                  LEFT JOIN menus sm ON sm.id = ops.selected_menu_id
                  WHERE ops.order_item_id = oi.id
                ),
                '[]'
              ) AS package_selections
       FROM order_items oi
       LEFT JOIN menus m ON m.id = oi.menu_id
       WHERE oi.order_id = $1`,
      [id]
    )
    order.items = itemsRes.rows
    return order
  },

  /** Get orders with optional status/search/date/browser_id filter and pagination — returns { rows, total } */
  findAll: async ({ status, search, date_from, date_to, browser_id, page = 1, limit = 10 } = {}) => {
    const whereParams = []
    let where = ''

    if (status) {
      whereParams.push(status)
      where += ` AND o.status = $${whereParams.length}`
    }
    if (search) {
      whereParams.push(`%${search}%`)
      where += ` AND o.customer_name ILIKE $${whereParams.length}`
    }
    if (date_from) {
      whereParams.push(date_from)
      where += ` AND DATE(o.created_at AT TIME ZONE 'Asia/Jakarta') >= $${whereParams.length}`
    }
    if (date_to) {
      whereParams.push(date_to)
      where += ` AND DATE(o.created_at AT TIME ZONE 'Asia/Jakarta') <= $${whereParams.length}`
    }
    if (browser_id) {
      whereParams.push(browser_id)
      where += ` AND o.browser_id = $${whereParams.length}`
    }

    const countRes = await query(
      `SELECT COUNT(*) FROM orders o WHERE 1=1${where}`,
      whereParams
    )
    const total = parseInt(countRes.rows[0].count, 10)

    const offset = (page - 1) * limit
    const dataRes = await query(
      `SELECT o.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',       oi.id,
                    'menu_id',  oi.menu_id,
                    'name',     COALESCE(oi.menu_name, m.name, 'Menu Dihapus'),
                    'price',    oi.price,
                    'quantity', oi.qty,
                    'subtotal', oi.subtotal,
                    'level',    oi.level,
                    'package_selections',
                    COALESCE(
                      (
                        SELECT json_agg(
                          json_build_object(
                            'id', ops.id,
                            'package_menu_rule_id', ops.package_menu_rule_id,
                            'menu_id', ops.selected_menu_id,
                            'menu_name', COALESCE(ops.selected_menu_name, sm.name, 'Menu Dihapus'),
                            'selected_level', ops.selected_level,
                            'qty', ops.qty
                          ) ORDER BY ops.id
                        )
                        FROM order_item_package_selections ops
                        LEFT JOIN menus sm ON sm.id = ops.selected_menu_id
                        WHERE ops.order_item_id = oi.id
                      ),
                      '[]'
                    )
                  ) ORDER BY oi.id
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN menus m ON m.id = oi.menu_id
        WHERE 1=1${where}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}`,
      [...whereParams, limit, offset]
    )
    return { rows: dataRes.rows, total }
  },

  /** Update order status */
  updateStatus: async (id, status) => {
    const res = await query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    )
    return res.rows[0] || null
  },

  /** Set payment reference on order */
  setPaymentReference: async (id, reference) => {
    const res = await query(
      `UPDATE orders SET payment_reference = $1 WHERE id = $2 RETURNING *`,
      [reference, id]
    )
    return res.rows[0] || null
  },
}

module.exports = orderModel
