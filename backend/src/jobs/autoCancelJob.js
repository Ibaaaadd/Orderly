const { query } = require('../config/db')

const INTERVAL_MS  = 60_000  // run every 60 seconds
const TIMEOUT_MINS = 10      // cancel after 10 minutes of no payment

/**
 * Cancel all pending orders that were created more than TIMEOUT_MINS ago,
 * and mark their associated payment records as 'failed'.
 */
async function cancelStaleOrders() {
  try {
    // Update orders
    const result = await query(
      `UPDATE orders
          SET status = 'cancelled'
        WHERE status = 'pending'
          AND created_at < NOW() - ($1 || ' minutes')::INTERVAL
        RETURNING id`,
      [TIMEOUT_MINS]
    )

    if (result.rows.length === 0) return

    const cancelledIds = result.rows.map((r) => r.id)

    // Update corresponding payment records
    await query(
      `UPDATE payments
          SET payment_status = 'failed'
        WHERE order_id = ANY($1::int[])
          AND payment_status = 'pending'`,
      [cancelledIds]
    )

    console.log(
      `[AutoCancel] Cancelled ${cancelledIds.length} stale order(s): ${cancelledIds.join(', ')}`
    )
  } catch (err) {
    // Log but do not crash the process
    console.error('[AutoCancel] Error during auto-cancel sweep:', err.message)
  }
}

function startAutoCancelJob() {
  console.log(
    `[AutoCancel] Started — checking every ${INTERVAL_MS / 1000}s, ` +
    `cancelling orders pending > ${TIMEOUT_MINS} min`
  )
  // Run once immediately on startup, then every INTERVAL_MS
  cancelStaleOrders()
  setInterval(cancelStaleOrders, INTERVAL_MS)
}

module.exports = { startAutoCancelJob }
