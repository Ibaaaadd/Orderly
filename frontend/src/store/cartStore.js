import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Cart store using Zustand with localStorage persistence.
 *
 * State shape:
 *  items       – array of cart line items
 *  total       – computed total price
 *  customerName – entered by user before checkout
 *  isOpen      – controls CartDrawer visibility
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      tableNumber: '',
      orderType: 'dine_in',
      isOpen: false,

      /** Open / close the cart drawer */
      openCart:  () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      /** Set customer name */
      setCustomerName: (name) => set({ customerName: name }),

      /** Set customer phone */
      setCustomerPhone: (phone) => set({ customerPhone: phone }),

      /** Set customer email */
      setCustomerEmail: (email) => set({ customerEmail: email }),

      /** Set table number */
      setTableNumber: (num) => set({ tableNumber: num }),

      /** Set order type */
      setOrderType: (type) => set({ orderType: type }),

      /** Add item or increment quantity if already in cart */
      addItem: (menu) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === menu.id)
          let items
          if (existing) {
            items = state.items.map((i) =>
              i.id === menu.id
                ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * Number(i.price) }
                : i
            )
          } else {
            const price = Number(menu.price)
            items = [
              ...state.items,
              {
                id:        menu.id,
                name:      menu.name,
                price,
                image_url: menu.image_url,
                qty:       1,
                subtotal:  price,
              },
            ]
          }
          return { items, total: calcTotal(items) }
        }),

      /** Decrease quantity or remove if qty reaches 0 */
      decreaseItem: (id) =>
        set((state) => {
          const items = state.items
            .map((i) =>
              i.id === id
                ? { ...i, qty: i.qty - 1, subtotal: (i.qty - 1) * Number(i.price) }
                : i
            )
            .filter((i) => i.qty > 0)
          return { items, total: calcTotal(items) }
        }),

      /** Completely remove an item from cart */
      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return { items, total: calcTotal(items) }
        }),

      /** Clear entire cart */
      clearCart: () => set({ items: [], total: 0, customerName: '', customerPhone: '', customerEmail: '', tableNumber: '', orderType: 'dine_in' }),
    }),
    {
      name: 'orderly-cart', // localStorage key
      version: 4,           // bumped: added tableNumber
      partialize: (state) => ({
        items:         state.items,
        total:         state.total,
        customerName:  state.customerName,
        customerPhone: state.customerPhone,
        customerEmail: state.customerEmail,
        tableNumber:   state.tableNumber,
        orderType:     state.orderType,
      }),
    }
  )
)

/** Helper: recalculate grand total from items array */
function calcTotal(items) {
  return items.reduce((sum, i) => sum + Number(i.subtotal), 0)
}

export default useCartStore
