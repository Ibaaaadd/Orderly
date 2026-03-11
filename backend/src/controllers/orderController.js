const orderModel = require('../models/orderModel')
const menuModel  = require('../models/menuModel')
const { calculateTotal } = require('../utils/calculateTotal')

/**
 * POST /api/orders
 *
 * Body: { customer_name, items: [{ menu_id, qty }] }
 */
async function createOrder(req, res, next) {
  try {
    const { customer_name, customer_phone, customer_email, table_number, order_type, items } = req.body

    // ── Input validation ──────────────────────────────────────────
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'customer_name wajib diisi' })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items tidak boleh kosong' })
    }
    if (order_type && !['dine_in', 'takeaway'].includes(order_type)) {
      return res.status(400).json({ success: false, message: 'order_type tidak valid' })
    }
    if (customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid' })
    }

    // ── Validate & enrich items with current prices ───────────────
    const enriched = []
    for (const item of items) {
      const menuId = parseInt(item.menu_id, 10)
      const qty    = parseInt(item.qty, 10)

      if (!menuId || qty < 1) {
        return res.status(400).json({ success: false, message: 'menu_id dan qty tidak valid' })
      }

      const menu = await menuModel.findById(menuId)
      if (!menu) {
        return res.status(404).json({
          success: false,
          message: `Menu dengan id ${menuId} tidak ditemukan`,
        })
      }
      if (!menu.is_available) {
        return res.status(400).json({
          success: false,
          message: `Menu "${menu.name}" sedang tidak tersedia`,
        })
      }

      enriched.push({ menu_id: menu.id, price: menu.price, qty })
    }

    // ── Calculate total ────────────────────────────────────────────
    const total_price = calculateTotal(enriched)

    // ── Persist ────────────────────────────────────────────────────
    const order = await orderModel.create({
      customer_name:  customer_name.trim(),
      customer_phone: customer_phone ? customer_phone.trim() : null,
      customer_email: customer_email ? customer_email.trim() : null,
      table_number:   table_number ? String(table_number).trim() : null,
      order_type:     order_type || 'dine_in',
      total_price,
      items: enriched,
    })

    res.status(201).json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders/:id
 */
async function getOrder(req, res, next) {
  try {
    const order = await orderModel.findById(parseInt(req.params.id, 10))
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' })
    }
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await orderModel.findAll()
    res.json({ success: true, data: orders })
  } catch (err) {
    next(err)
  }
}

module.exports = { createOrder, getOrder, getAllOrders }
