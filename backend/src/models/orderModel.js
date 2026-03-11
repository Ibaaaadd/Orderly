const { query, pool } = require('../config/db')

/**
 * Order model – raw SQL queries for orders & order_items tables.
 */
const orderModel = {
  /** Create order + items in a single transaction */
  create: async ({ customer_name, customer_phone, customer_email, table_number, order_type, total_price, items }) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert order
      const orderRes = await client.query(
        `INSERT INTO orders (customer_name, customer_phone, customer_email, table_number, order_type, total_price, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [customer_name, customer_phone || null, customer_email || null, table_number || null, order_type || 'dine_in', total_price]
      )
      const order = orderRes.rows[0]

      // Insert items
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, menu_id, price, qty, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.menu_id, item.price, item.qty, item.subtotal]
        )
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

    // Fetch items with menu names
    const itemsRes = await query(
      `SELECT oi.*, m.name
       FROM order_items oi
       LEFT JOIN menus m ON m.id = oi.menu_id
       WHERE oi.order_id = $1`,
      [id]
    )
    order.items = itemsRes.rows
    return order
  },

  /** Get all orders with their items (most recent first) */
  findAll: async () => {
    const res = await query(
      `SELECT o.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',       oi.id,
                    'menu_id',  oi.menu_id,
                    'name',     m.name,
                    'price',    oi.price,
                    'quantity', oi.qty,
                    'subtotal', oi.subtotal
                  ) ORDER BY oi.id
                ) FILTER (WHERE oi.id IS NOT NULL),
                '[]'
              ) AS items
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         LEFT JOIN menus m ON m.id = oi.menu_id
        GROUP BY o.id
        ORDER BY o.created_at DESC`,
      []
    )
    return res.rows
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
