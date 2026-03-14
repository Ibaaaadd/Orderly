const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const { verifyPassword } = require('../utils/passwordHash')

function getJwtSecret() {
  return process.env.AUTH_JWT_SECRET || 'orderly-dev-secret-change-me'
}

function buildAuthUser(user) {
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
  }
}

function signToken(user) {
  const payload = {
    sub: String(user.id),
    username: user.username,
    role: user.role,
  }
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.AUTH_JWT_EXPIRES_IN || '12h',
  })
}

async function login(req, res, next) {
  try {
    const username = String(req.body?.username || '').trim()
    const password = String(req.body?.password || '')

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' })
    }

    const user = await userModel.findByUsername(username)
    const passwordOk = user ? verifyPassword(password, user.password_hash) : false

    if (!user || !user.is_active || !passwordOk) {
      return res.status(401).json({ success: false, message: 'Username atau password tidak valid' })
    }

    const token = signToken(user)
    return res.json({
      success: true,
      data: {
        token,
        user: buildAuthUser(user),
      },
    })
  } catch (err) {
    next(err)
  }
}

async function me(req, res) {
  res.json({ success: true, data: { user: buildAuthUser(req.user) } })
}

module.exports = {
  login,
  me,
}
