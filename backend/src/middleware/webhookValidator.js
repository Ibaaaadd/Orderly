const crypto = require('crypto')

/**
 * Webhook signature validator middleware.
 *
 * In production each payment gateway sends a signature in the request header
 * to prove the webhook is genuine. This middleware validates that signature
 * before allowing the request to continue.
 *
 * Set PAYMENT_GATEWAY env var to switch validation strategy:
 *  - 'midtrans' → validates X-Signature-Key header
 *  - 'xendit'   → validates x-callback-token header
 *  - 'mock'     → skips validation (development only)
 */
function webhookValidator(req, res, next) {
  const gateway = process.env.PAYMENT_GATEWAY || 'mock'

  // ── Mock: skip validation ──────────────────────────────────────
  if (gateway === 'mock') {
    return next()
  }

  // ── Midtrans ───────────────────────────────────────────────────
  if (gateway === 'midtrans') {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
    const {
      order_id,
      status_code,
      gross_amount,
    } = req.body

    const signatureKey = req.headers['x-signature-key']
    const expected = crypto
      .createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex')

    if (!signatureKey || signatureKey !== expected) {
      console.warn('[Webhook] Invalid Midtrans signature')
      return res.status(403).json({ success: false, message: 'Invalid signature' })
    }
    return next()
  }

  // ── Xendit ─────────────────────────────────────────────────────
  if (gateway === 'xendit') {
    const callbackToken = process.env.XENDIT_CALLBACK_TOKEN || ''
    const headerToken   = req.headers['x-callback-token']

    if (!headerToken || headerToken !== callbackToken) {
      console.warn('[Webhook] Invalid Xendit callback token')
      return res.status(403).json({ success: false, message: 'Invalid callback token' })
    }
    return next()
  }

  // Unknown gateway — deny
  res.status(400).json({ success: false, message: 'Unknown payment gateway' })
}

module.exports = { webhookValidator }
