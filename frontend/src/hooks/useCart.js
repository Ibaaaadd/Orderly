import useCartStore from '../store/cartStore.js'

/**
 * useCart – convenience hook that exposes cart state + actions.
 * Components import this instead of useCartStore directly
 * so we have one abstraction layer over Zustand.
 */
export default function useCart() {
  const items        = useCartStore((s) => s.items)
  const total        = useCartStore((s) => s.total)
  const customerName = useCartStore((s) => s.customerName)
  const isOpen       = useCartStore((s) => s.isOpen)
  const itemCount    = items.reduce((n, i) => n + i.qty, 0)

  const {
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setCustomerName,
  } = useCartStore.getState()

  return {
    items,
    total,
    customerName,
    isOpen,
    itemCount,
    addItem,
    decreaseItem,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setCustomerName,
  }
}
