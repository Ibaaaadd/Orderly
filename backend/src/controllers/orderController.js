const orderModel = require('../models/orderModel')
const menuModel  = require('../models/menuModel')
const { calculateTotal } = require('../utils/calculateTotal')

function parsePositiveInt(value) {
  const n = parseInt(value, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}

function pickSmallestLevel(levels = []) {
  const normalized = Array.isArray(levels)
    ? levels.map((level) => String(level).trim()).filter(Boolean)
    : []

  if (normalized.length === 0) return null

  // Prefer level 1 as default when available.
  const levelOne = normalized.find((level) => Number(level) === 1)
  if (levelOne) return levelOne

  return [...normalized].sort((a, b) => {
    const numA = Number(a)
    const numB = Number(b)
    const isNumA = !Number.isNaN(numA)
    const isNumB = !Number.isNaN(numB)

    if (isNumA && isNumB) return numA - numB
    if (isNumA) return -1
    if (isNumB) return 1
    return a.localeCompare(b, 'id', { numeric: true, sensitivity: 'base' })
  })[0]
}

async function normalizePackageSelections({ packageMenu, orderQty, rawSelections }) {
  const rules = await menuModel.getPackageRules(packageMenu.id)
  if (!rules.length) {
    throw new Error(`Menu paket "${packageMenu.name}" belum punya aturan komposisi paket`) // handled by caller
  }

  const configuredSelections = rules.flatMap((rule) => {
    const items = Array.isArray(rule.configured_items) ? rule.configured_items : []
    return items.map((item) => ({
      package_menu_rule_id: rule.id,
      selected_menu_id: item.selected_menu_id || null,
      selected_menu_name: item.selected_menu_name || null,
      selected_level: item.selected_level || null,
      qty: (parsePositiveInt(item.qty) || 1) * orderQty,
    }))
  })

  if (configuredSelections.length === 0) {
    throw new Error(`Menu paket "${packageMenu.name}" belum punya isi paket yang dikonfigurasi admin`)
  }

  // Customer-side package detail is ignored by design; package composition is admin-fixed.
  if (Array.isArray(rawSelections) && rawSelections.length > 0) {
    // no-op, kept for backward compatibility
  }

  const menuIds = configuredSelections
    .map((selection) => parsePositiveInt(selection.selected_menu_id))
    .filter(Boolean)
  const existingMenus = await menuModel.findByIds(menuIds)
  const menusById = new Map(existingMenus.map((menu) => [menu.id, menu]))

  for (const selection of configuredSelections) {
    const selectedMenu = menusById.get(selection.selected_menu_id)
    if (!selectedMenu) {
      throw new Error(`Isi paket untuk "${packageMenu.name}" memiliki menu yang sudah tidak tersedia`)
    }
    if (!selectedMenu.is_available) {
      throw new Error(`Menu "${selectedMenu.name}" pada paket "${packageMenu.name}" sedang tidak tersedia`)
    }
    if (!selection.selected_menu_name) {
      selection.selected_menu_name = selectedMenu.name
    }
    if (Array.isArray(selectedMenu.levels) && selectedMenu.levels.length > 0) {
      const smallestLevel = pickSmallestLevel(selectedMenu.levels)

      if (!selection.selected_level) {
        selection.selected_level = smallestLevel
      }

      if (selection.selected_level && !selectedMenu.levels.includes(selection.selected_level)) {
        selection.selected_level = smallestLevel
      }
    }
  }

  return configuredSelections
}

/**
 * POST /api/orders
 *
 * Body: { customer_name, items: [{ menu_id, qty }] }
 */
async function createOrder(req, res, next) {
  try {
    const { customer_name, customer_phone, customer_email, table_number, order_type, browser_id, items } = req.body

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

      // Validate level if menu has levels configured
      if (Array.isArray(menu.levels) && menu.levels.length > 0) {
        if (!item.level || !menu.levels.includes(item.level)) {
          return res.status(400).json({
            success: false,
            message: `Silakan pilih level untuk menu "${menu.name}"`,
          })
        }
      }

      let package_selections = []
      if (menu.is_package) {
        try {
          package_selections = await normalizePackageSelections({
            packageMenu: menu,
            orderQty: qty,
            rawSelections: item.package_selections,
          })
        } catch (error) {
          return res.status(400).json({ success: false, message: error.message })
        }
      }

      enriched.push({
        menu_id: menu.id,
        menu_name: menu.name,
        price: menu.price,
        qty,
        level: item.level || null,
        package_selections,
      })
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
      browser_id:     browser_id || null,
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
 * Optional query: ?status=pending&search=budi&page=1&limit=10
 */
async function getAllOrders(req, res, next) {
  try {
    const { status, search, date_from, date_to, browser_id, page = '1', limit = '10' } = req.query
    const pageNum  = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(10000, Math.max(1, parseInt(limit, 10) || 10))

    const { rows, total } = await orderModel.findAll({
      status:     status     || undefined,
      search:     search     || undefined,
      date_from:  date_from  || undefined,
      date_to:    date_to    || undefined,
      browser_id: browser_id || undefined,
      page:       pageNum,
      limit:      limitNum,
    })

    res.json({
      success: true,
      data: rows,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/orders/:id/cancel
 * Allows a customer to cancel their own pending order.
 */
async function cancelOrder(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' })
    }

    const order = await orderModel.findById(id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' })
    }
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Pesanan tidak dapat dibatalkan karena statusnya sudah '${order.status}'`,
      })
    }

    const updated = await orderModel.updateStatus(id, 'cancelled')
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/orders/:id/ready
 * Kitchen marks a paid order as ready/prepared.
 */
async function markReady(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' })
    }

    const order = await orderModel.findById(id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' })
    }
    if (order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Hanya pesanan berstatus 'paid' yang bisa ditandai siap`,
      })
    }

    const updated = await orderModel.updateStatus(id, 'ready')
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/orders/:id/complete
 * Kitchen confirms order has been delivered to the table.
 */
async function markCompleted(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' })
    }

    const order = await orderModel.findById(id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' })
    }
    if (order.status !== 'ready') {
      return res.status(400).json({
        success: false,
        message: `Hanya pesanan berstatus 'ready' yang bisa ditandai selesai diantar`,
      })
    }

    const updated = await orderModel.updateStatus(id, 'completed')
    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

module.exports = { createOrder, getOrder, getAllOrders, cancelOrder, markReady, markCompleted }
