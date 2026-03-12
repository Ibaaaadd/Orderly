import api from './api.js'
import { getBrowserId } from '../utils/browserId.js'

/**
 * Order service – wraps all order-related API calls.
 */
const orderService = {
  /**
   * Create a new order.
   * @param {{ customer_name: string, items: Array<{menu_id: number, qty: number}> }} payload
   */
  createOrder: (payload) => api.post('/orders', { ...payload, browser_id: getBrowserId() }),

  /**
   * Fetch a single order by ID (used for status polling).
   * @param {number|string} id
   */
  getOrder: (id) => api.get(`/orders/${id}`),

  /**
   * Fetch orders belonging to this browser only.
   */
  getAllOrders: () => api.get(`/orders?browser_id=${getBrowserId()}`),

  /**
   * Cancel a pending order (customer-initiated).
   * @param {number|string} id
   */
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
}

export default orderService
