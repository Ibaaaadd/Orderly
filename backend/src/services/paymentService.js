const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

/**
 * Payment Service — gateway-agnostic abstraction.
 *
 * Supported gateways (set via PAYMENT_GATEWAY env var):
 *  - 'midtrans'  → uses Midtrans Snap API
 *  - 'xendit'    → uses Xendit QR Codes API
 *  - 'mock'      → local mock (development / demo)
 *
 * Each gateway implements:
 *   createQRISPayment(order) → { reference_id, qris_url }
 *   handleWebhook(payload)   → { reference_id, status: 'paid' | 'failed' }
 */

const GATEWAY = process.env.PAYMENT_GATEWAY || 'mock'

// ─────────────────────────────────────────────
// Mock Gateway (demo / development)
// ─────────────────────────────────────────────
const mockGateway = {
  async createQRISPayment(order) {
    const reference_id = `MOCK-${uuidv4().slice(0, 8).toUpperCase()}`
    // In mock mode we encode the order info as a JSON string in the QR data.
    // In production this would be a real QRIS deep-link URL from the gateway.
    const qris_url = JSON.stringify({
      merchant: 'Orderly Restaurant',
      order_id: order.id,
      amount:   order.total_price,
      reference: reference_id,
    })
    return { reference_id, qris_url }
  },

  handleWebhook(payload) {
    // Mock webhook: payload should include { reference_id, status }
    const status = payload.status === 'paid' ? 'paid' : 'failed'
    return { reference_id: payload.reference_id, status }
  },
}

// ─────────────────────────────────────────────
// Midtrans Gateway
// Docs: https://api-docs.midtrans.com/#qris
// ─────────────────────────────────────────────
const midtransGateway = {
  async createQRISPayment(order) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) throw new Error('MIDTRANS_SERVER_KEY is not set')

    const auth = Buffer.from(`${serverKey}:`).toString('base64')
    const payload = {
      payment_type: 'qris',
      transaction_details: {
        order_id:     `ORD-${order.id}-${Date.now()}`,
        gross_amount: order.total_price,
      },
      customer_details: {
        first_name: order.customer_name,
      },
    }

    const res = await axios.post(
      'https://api.midtrans.com/v2/charge',
      payload,
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }
    )

    const qris_url    = res.data.actions?.find((a) => a.name === 'generate-qr-code')?.url || ''
    const reference_id = res.data.transaction_id

    return { reference_id, qris_url }
  },

  handleWebhook(payload) {
    // Midtrans sends transaction_status: 'settlement' for success
    const status = payload.transaction_status === 'settlement' ? 'paid' : 'failed'
    return { reference_id: payload.transaction_id, status }
  },
}

// ─────────────────────────────────────────────
// Xendit Gateway
// Docs: https://developers.xendit.co/api-reference/#create-qr-code
// ─────────────────────────────────────────────
const xenditGateway = {
  async createQRISPayment(order) {
    const apiKey = process.env.XENDIT_API_KEY
    if (!apiKey) throw new Error('XENDIT_API_KEY is not set')

    const reference_id = `ORD-${order.id}-${Date.now()}`
    const res = await axios.post(
      'https://api.xendit.co/qr_codes',
      {
        external_id:   reference_id,
        type:          'DYNAMIC',
        callback_url:  process.env.XENDIT_CALLBACK_URL || 'https://your-domain.com/api/payments/webhook',
        amount:        order.total_price,
      },
      {
        auth: { username: apiKey, password: '' },
        headers: { 'Content-Type': 'application/json' },
      }
    )

    return {
      reference_id,
      qris_url: res.data.qr_string,
    }
  },

  handleWebhook(payload) {
    // Xendit sends status: 'ACTIVE' (created) or 'COMPLETED' (paid)
    const status = payload.status === 'COMPLETED' ? 'paid' : 'failed'
    return { reference_id: payload.external_id, status }
  },
}

// ─────────────────────────────────────────────
// Gateway selector
// ─────────────────────────────────────────────
const gateways = {
  mock:      mockGateway,
  midtrans:  midtransGateway,
  xendit:    xenditGateway,
}

const activeGateway = gateways[GATEWAY] || gateways.mock

const paymentService = {
  /**
   * Create a QRIS payment for the given order.
   * @param {object} order – order row from DB
   * @returns {{ reference_id: string, qris_url: string }}
   */
  createQRISPayment: (order) => activeGateway.createQRISPayment(order),

  /**
   * Parse a payment webhook payload.
   * @param {object} payload – raw webhook body
   * @returns {{ reference_id: string, status: 'paid' | 'failed' }}
   */
  handleWebhook: (payload) => activeGateway.handleWebhook(payload),
}

module.exports = paymentService
