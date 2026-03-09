/**
 * calculateTotal – computes total price from validated order items.
 *
 * @param {Array<{ price: number, qty: number }>} items
 * @returns {number} total in IDR
 */
function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const subtotal = Math.round(item.price * item.qty)
    item.subtotal = subtotal // attach subtotal to item for convenience
    return sum + subtotal
  }, 0)
}

module.exports = { calculateTotal }
