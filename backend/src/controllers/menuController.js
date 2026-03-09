const menuModel = require('../models/menuModel')

/**
 * GET /api/menus
 * Optional query: ?category_id=1
 */
async function getMenus(req, res, next) {
  try {
    const { category_id } = req.query
    const menus = await menuModel.findAll({
      category_id: category_id ? parseInt(category_id, 10) : undefined,
    })
    res.json({ success: true, data: menus })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/menus/:id
 */
async function getMenuById(req, res, next) {
  try {
    const menu = await menuModel.findById(parseInt(req.params.id, 10))
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' })
    }
    res.json({ success: true, data: menu })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/menus
 */
async function createMenu(req, res, next) {
  try {
    const { category_id, name, price, image_url, is_available } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama menu wajib diisi' })
    }
    const numericPrice = Number(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: 'Harga tidak valid' })
    }
    const menu = await menuModel.create({ category_id, name: name.trim(), price: numericPrice, image_url, is_available })
    res.status(201).json({ success: true, data: menu })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/menus/:id
 */
async function updateMenu(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const fields = req.body
    if (fields.price !== undefined) {
      const n = Number(fields.price)
      if (isNaN(n) || n < 0) {
        return res.status(400).json({ success: false, message: 'Harga tidak valid' })
      }
      fields.price = n
    }
    const menu = await menuModel.update(id, fields)
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' })
    }
    res.json({ success: true, data: menu })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/menus/:id
 */
async function deleteMenu(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    const deleted = await menuModel.delete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' })
    }
    res.json({ success: true, message: 'Menu berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getMenus, getMenuById, createMenu, updateMenu, deleteMenu }
