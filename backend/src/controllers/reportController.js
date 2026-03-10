const { query } = require('../config/db')

/**
 * GET /api/reports/summary
 * Dashboard statistics – counts and revenue totals.
 */
async function getSummary(req, res, next) {
  try {
    const statsRes = await query(`
      SELECT
        COUNT(*)                                                        AS total_orders,
        COUNT(*) FILTER (WHERE DATE(created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE) AS orders_today,
        COUNT(*) FILTER (WHERE status = 'pending')                     AS orders_pending,
        COUNT(*) FILTER (WHERE status = 'paid')                        AS orders_paid,
        COUNT(*) FILTER (WHERE status = 'cancelled')                   AS orders_cancelled,
        COALESCE(SUM(total_price) FILTER (WHERE status = 'paid'), 0)   AS total_revenue,
        COALESCE(
          SUM(total_price) FILTER (
            WHERE status = 'paid'
            AND DATE(created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE
          ), 0
        )                                                               AS revenue_today,
        COALESCE(
          SUM(total_price) FILTER (
            WHERE status = 'paid'
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
          ), 0
        )                                                               AS revenue_this_month
      FROM orders
    `)

    const menuRes = await query(`
      SELECT
        COUNT(*)                                        AS total_menus,
        COUNT(*) FILTER (WHERE is_available = TRUE)    AS active_menus
      FROM menus
    `)

    res.json({
      success: true,
      data: {
        ...statsRes.rows[0],
        ...menuRes.rows[0],
      },
    })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/reports/monthly?year=2025
 * Monthly revenue & order counts for a given year.
 */
async function getMonthlyReport(req, res, next) {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear()
    if (year < 2000 || year > 2100) {
      return res.status(400).json({ success: false, message: 'Tahun tidak valid' })
    }

    const result = await query(
      `SELECT
          EXTRACT(MONTH FROM created_at)::int      AS month,
          COUNT(*)                                  AS total_orders,
          COUNT(*) FILTER (WHERE status = 'paid')  AS paid_orders,
          COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_orders,
          COALESCE(SUM(total_price) FILTER (WHERE status = 'paid'), 0) AS revenue
       FROM orders
       WHERE EXTRACT(YEAR FROM created_at) = $1
       GROUP BY EXTRACT(MONTH FROM created_at)
       ORDER BY month`,
      [year]
    )

    // Fill all 12 months even if no data
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = result.rows.find((r) => r.month === i + 1)
      return {
        month:             i + 1,
        total_orders:      found ? parseInt(found.total_orders)      : 0,
        paid_orders:       found ? parseInt(found.paid_orders)       : 0,
        cancelled_orders:  found ? parseInt(found.cancelled_orders)  : 0,
        revenue:           found ? parseFloat(found.revenue)         : 0,
      }
    })

    res.json({ success: true, data: months, year })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/reports/top-menus?limit=10
 * Top-selling menu items by quantity.
 */
async function getTopMenus(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50)
    const result = await query(
      `SELECT
          m.name,
          SUM(oi.qty)      AS total_qty,
          SUM(oi.subtotal) AS total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN menus m ON m.id = oi.menu_id
       WHERE o.status = 'paid'
       GROUP BY m.name
       ORDER BY total_qty DESC
       LIMIT $1`,
      [limit]
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

module.exports = { getSummary, getMonthlyReport, getTopMenus }
