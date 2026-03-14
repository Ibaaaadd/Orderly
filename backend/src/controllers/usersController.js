const usersModel = require('../models/usersModel')
const { hashPassword } = require('../utils/passwordHash')

const ALLOWED_ROLES = ['admin', 'kitchen', 'cashier']

function normalizeRole(value) {
  const role = String(value || '').trim().toLowerCase()
  return ALLOWED_ROLES.includes(role) ? role : null
}

function normalizeBoolean(value, fallback = true) {
  if (value === undefined) return fallback
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

async function getUsers(_req, res, next) {
  try {
    const users = await usersModel.findAll()
    res.json({ success: true, data: users })
  } catch (err) {
    next(err)
  }
}

async function createUser(req, res, next) {
  try {
    const username = String(req.body?.username || '').trim()
    const fullName = String(req.body?.full_name || '').trim()
    const password = String(req.body?.password || '')
    const role = normalizeRole(req.body?.role)
    const isActive = normalizeBoolean(req.body?.is_active, true)

    if (!username) {
      return res.status(400).json({ success: false, message: 'Username wajib diisi' })
    }
    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' })
    }
    if (!role) {
      return res.status(400).json({ success: false, message: 'Role tidak valid' })
    }

    const user = await usersModel.create({
      username,
      password_hash: hashPassword(password),
      full_name: fullName,
      role,
      is_active: isActive,
    })

    res.status(201).json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' })
    }

    const payload = {}

    if (req.body.username !== undefined) {
      const username = String(req.body.username || '').trim()
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username wajib diisi' })
      }
      payload.username = username
    }

    if (req.body.full_name !== undefined) {
      const fullName = String(req.body.full_name || '').trim()
      if (!fullName) {
        return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi' })
      }
      payload.full_name = fullName
    }

    if (req.body.role !== undefined) {
      const role = normalizeRole(req.body.role)
      if (!role) {
        return res.status(400).json({ success: false, message: 'Role tidak valid' })
      }
      payload.role = role
    }

    if (req.body.is_active !== undefined) {
      payload.is_active = normalizeBoolean(req.body.is_active, true)
    }

    if (req.body.password !== undefined && String(req.body.password).length > 0) {
      const password = String(req.body.password)
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' })
      }
      payload.password_hash = hashPassword(password)
    }

    const updated = await usersModel.update(id, payload)
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' })
    }

    res.json({ success: true, data: updated })
  } catch (err) {
    next(err)
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID tidak valid' })
    }

    if (req.user?.id === id) {
      return res.status(400).json({ success: false, message: 'Tidak bisa menghapus akun sendiri' })
    }

    const removed = await usersModel.remove(id)
    if (!removed) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' })
    }

    res.json({ success: true, message: 'User berhasil dihapus' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
}
