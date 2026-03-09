require('dotenv').config()
const app = require('./app')
const { testConnection } = require('./config/db')
const { startAutoCancelJob } = require('./jobs/autoCancelJob')

const PORT = process.env.PORT || 5000

async function start() {
  // Verify DB connection before accepting traffic
  await testConnection()
  startAutoCancelJob()

  const server = app.listen(PORT, () => {
    console.log(`[Server] Orderly backend running on http://localhost:${PORT}`)
    console.log(`[Server] Gateway: ${process.env.PAYMENT_GATEWAY || 'mock'}`)
    console.log(`[Server] ENV: ${process.env.NODE_ENV || 'development'}`)
  })

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n[Server] ${signal} received. Shutting down…`)
    server.close(() => {
      console.log('[Server] HTTP server closed')
      process.exit(0)
    })
    // Force exit if graceful shutdown takes too long
    setTimeout(() => process.exit(1), 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT',  () => shutdown('SIGINT'))
}

start().catch((err) => {
  console.error('[Server] Failed to start:', err)
  process.exit(1)
})
