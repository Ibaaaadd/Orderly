import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import CartItem from '../components/cart/CartItem.jsx'
import CartSummary from '../components/cart/CartSummary.jsx'
import Input from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useCartStore from '../store/cartStore.js'
import orderService from '../services/orderService.js'
import paymentService from '../services/paymentService.js'

/**
 * CartPage – full-page cart view (alternative to drawer).
 * Accessible via /cart route.
 */
export default function CartPage() {
  const navigate = useNavigate()
  const toast    = useToast()

  const items        = useCartStore((s) => s.items)
  const total        = useCartStore((s) => s.total)
  const customerName = useCartStore((s) => s.customerName)
  const setCustomerName = useCartStore((s) => s.setCustomerName)
  const clearCart    = useCartStore((s) => s.clearCart)

  const [loading,   setLoading]   = useState(false)
  const [nameError, setNameError] = useState('')

  const isEmpty = items.length === 0

  async function handleCheckout() {
    if (!customerName.trim()) {
      setNameError('Nama pelanggan wajib diisi')
      return
    }
    setNameError('')
    setLoading(true)

    try {
      const order = await orderService.createOrder({
        customer_name: customerName.trim(),
        items: items.map((i) => ({ menu_id: i.id, qty: i.qty })),
      })
      await paymentService.createPayment(order.data.id)
      clearCart()
      navigate(`/payment/${order.data.id}`)
    } catch (err) {
      toast.error(err.message || 'Gagal membuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      {/* Back button */}
      <div className="flex items-center gap-3 py-5">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-surface-100 transition-colors text-zinc-500"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-zinc-900">Keranjang Saya</h1>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
          <ShoppingBag size={56} className="mb-4 opacity-30" />
          <p className="font-semibold text-zinc-500 text-lg">Keranjang kosong</p>
          <p className="text-sm mt-1">Tambahkan menu favoritmu!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
          >
            Lihat Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 px-4 divide-y divide-surface-100">
            <AnimatePresence>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Customer name */}
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-4">
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
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-4">
            <CartSummary
              total={total}
              onCheckout={handleCheckout}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </Container>
  )
}
