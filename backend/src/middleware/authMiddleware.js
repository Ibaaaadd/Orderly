const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')

function getJwtSecret() {
  return process.env.AUTH_JWT_SECRET || 'orderly-dev-secret-change-me'
}

function parseBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== 'string') return null
  const [scheme, token] = headerValue.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

async function requireAuth(req, res, next) {
  try {
    const token = parseBearerToken(req.headers.authorization)
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const payload = jwt.verify(token, getJwtSecret())
    const userId = parseInt(payload.sub, 10)
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const user = await userModel.findById(userId)
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    req.user = user
    return next()
  } catch (_err) {
    return res.status(401).json({ success: false, message: 'Unauthorized' })
  }
}

function requireRoles(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles]

  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' })
    }
    return next()
  }
}

module.exports = {
  requireAuth,
  requireRoles,
}
