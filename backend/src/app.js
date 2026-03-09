require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')

const categoryRoutes = require('./routes/categoryRoutes')
const menuRoutes     = require('./routes/menuRoutes')
const orderRoutes    = require('./routes/orderRoutes')
const paymentRoutes  = require('./routes/paymentRoutes')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// ── Security & transport middleware ──────────────────────────────
app.use(helmet())

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Request parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// ── Rate limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
})
app.use('/api', limiter)

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }))

// ── API routes ────────────────────────────────────────────────────
app.use('/api/categories', categoryRoutes)
app.use('/api/menus',      menuRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/payments',   paymentRoutes)

// ── 404 handler ───────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' })
})

// ── Global error handler (must be last) ───────────────────────────
app.use(errorHandler)

module.exports = app
