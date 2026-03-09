import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore.js'
import CartItem from './CartItem.jsx'
import CartSummary from './CartSummary.jsx'
import Input from '../ui/Input.jsx'
import orderService from '../../services/orderService.js'
import paymentService from '../../services/paymentService.js'
import { useToast } from '../ui/Toast.jsx'

/**
 * CartDrawer – slides in from the right.
 * Shows cart items, customer name input, and checkout flow.
 */
export default function CartDrawer() {
  const navigate = useNavigate()
  const toast    = useToast()

  const isOpen       = useCartStore((s) => s.isOpen)
  const items        = useCartStore((s) => s.items)
  const total        = useCartStore((s) => s.total)
  const customerName = useCartStore((s) => s.customerName)
  const closeCart    = useCartStore((s) => s.closeCart)
  const setCustomerName = useCartStore((s) => s.setCustomerName)
  const clearCart    = useCartStore((s) => s.clearCart)

  const [loading,  setLoading]  = useState(false)
  const [nameError, setNameError] = useState('')

  const isEmpty = items.length === 0

  async function handleCheckout() {
    // Validate customer name
    if (!customerName.trim()) {
      setNameError('Nama pelanggan wajib diisi')
      return
    }
    setNameError('')

    setLoading(true)
    try {
      // 1. Create order
      const order = await orderService.createOrder({
        customer_name: customerName.trim(),
        items: items.map((i) => ({ menu_id: i.id, qty: i.qty })),
      })

      // 2. Create payment (get QRIS URL)
      await paymentService.createPayment(order.data.id)

      // 3. Clear cart & navigate to payment page
      clearCart()
      closeCart()
      navigate(`/payment/${order.data.id}`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-strong flex flex-col"
            aria-label="Keranjang belanja"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary-500" />
                <h2 className="font-bold text-zinc-800">Keranjang</h2>
                {!isEmpty && (
                  <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.reduce((n, i) => n + i.qty, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-surface-100 transition-colors"
                aria-label="Tutup keranjang"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-16">
                  <ShoppingCart size={48} className="mb-4 opacity-30" />
                  <p className="font-semibold text-zinc-500">Keranjang kosong</p>
                  <p className="text-sm mt-1">Tambahkan menu favoritmu!</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="px-5 py-5 border-t border-surface-100 space-y-4">
                {/* Customer name input */}
                <Input
                  label="Nama Pelanggan"
                  placeholder="Masukkan nama kamu..."
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    if (nameError) setNameError('')
                  }}
                  error={nameError}
                  fullWidth
                />

                <CartSummary
                  total={total}
                  onCheckout={handleCheckout}
                  loading={loading}
                  disabled={isEmpty || loading}
                />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>,
    document.body
  )
}
