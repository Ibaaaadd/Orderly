import api from './api.js'

/**
 * Payment service – wraps payment-related API calls.
 */
const paymentService = {
  /** Initiate QRIS payment for an order. */
  createPayment: (orderId) =>
    api.post('/payments/create', { order_id: orderId }),

  /** Initiate cash payment (order stays pending until cashier confirms). */
  createCashPayment: (orderId) =>
    api.post('/payments/cash', { order_id: orderId }),

  /** Cashier confirms cash received — marks order as paid. */
  confirmCashPayment: (orderId) =>
    api.patch(`/payments/cash/${orderId}/confirm`),
}

export default paymentService
