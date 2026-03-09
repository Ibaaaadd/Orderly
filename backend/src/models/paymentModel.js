const { query } = require('../config/db')

/**
 * Payment model – raw SQL queries for the payments table.
 */
const paymentModel = {
  /** Create a payment record */
  create: async ({ order_id, gateway, reference_id, qris_url }) => {
    const res = await query(
      `INSERT INTO payments (order_id, gateway, reference_id, qris_url, payment_status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [order_id, gateway, reference_id, qris_url]
    )
    return res.rows[0]
  },

  /** Find by order id */
  findByOrderId: async (order_id) => {
    const res = await query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1',
      [order_id]
    )
    return res.rows[0] || null
  },

  /** Find by payment reference id (used in webhook) */
  findByReference: async (reference_id) => {
    const res = await query(
      'SELECT * FROM payments WHERE reference_id = $1',
      [reference_id]
    )
    return res.rows[0] || null
  },

  /** Update payment status */
  updateStatus: async (id, payment_status) => {
    const res = await query(
      `UPDATE payments SET payment_status = $1 WHERE id = $2 RETURNING *`,
      [payment_status, id]
    )
    return res.rows[0] || null
  },
}

module.exports = paymentModel
