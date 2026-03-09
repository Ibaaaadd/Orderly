import api from './api.js'

/**
 * Payment service – wraps payment-related API calls.
 * Designed to be gateway-agnostic (Midtrans / Xendit).
 */
const paymentService = {
  /**
   * Initiate QRIS payment for an order.
   * @param {number|string} orderId
   * @returns {{ qris_url: string, reference_id: string }}
   */
  createPayment: (orderId) =>
    api.post('/payments/create', { order_id: orderId }),
}

export default paymentService
