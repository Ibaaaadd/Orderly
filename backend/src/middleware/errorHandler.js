/**
 * Global Express error handler.
 * Must be registered as the last middleware in app.js.
 */
function errorHandler(err, req, res, next) {
  // Log the error (in production, use a proper logger like Winston/Pino)
  console.error('[Error]', err.message)
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  // PostgreSQL-specific error codes
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Data duplikat' })
  }
  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referensi tidak valid' })
  }

  const statusCode = err.statusCode || err.status || 500
  const message    = statusCode < 500 ? err.message : 'Terjadi kesalahan server'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  })
}

module.exports = { errorHandler }
