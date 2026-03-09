import api from './api.js'

/**
 * Order service – wraps all order-related API calls.
 */
const orderService = {
  /**
   * Create a new order.
   * @param {{ customer_name: string, items: Array<{menu_id: number, qty: number}> }} payload
   */
  createOrder: (payload) => api.post('/orders', payload),

  /**
   * Fetch a single order by ID (used for status polling).
   * @param {number|string} id
   */
  getOrder: (id) => api.get(`/orders/${id}`),

  /**
   * Fetch all orders (for history page).
   */
  getAllOrders: () => api.get('/orders'),
}

export default orderService
