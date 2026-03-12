const { query } = require('../config/db')

/**
 * GET /api/categories
 * Returns all menu categories.
 */
async function getCategories(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, icon_key, color_key FROM categories ORDER BY id ASC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/categories
 */
async function createCategory(req, res, next) {
  try {
    const { name, icon_key, color_key } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' })
    }
    const result = await query(
      'INSERT INTO categories (name, icon_key, color_key) VALUES ($1, $2, $3) RETURNING *',
      [name.trim(), icon_key || 'tag', color_key || 'primary']
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/categories/:id
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params
    const { name, icon_key, color_key } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' })
    }
    const result = await query(
      'UPDATE categories SET name = $1, icon_key = $2, color_key = $3 WHERE id = $4 RETURNING *',
      [name.trim(), icon_key || 'tag', color_key || 'primary', parseInt(id, 10)]
    )
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/categories/:id
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params
    const result = await query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [parseInt(id, 10)]
    )
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' })
    }
    res.json({ success: true, message: 'Kategori berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory }
