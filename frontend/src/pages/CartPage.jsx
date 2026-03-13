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
  const customerPhone = useCartStore((s) => s.customerPhone)
  const setCustomerPhone = useCartStore((s) => s.setCustomerPhone)
  const customerEmail = useCartStore((s) => s.customerEmail)
  const setCustomerEmail = useCartStore((s) => s.setCustomerEmail)
  const tableNumber  = useCartStore((s) => s.tableNumber)
  const setTableNumber = useCartStore((s) => s.setTableNumber)
  const orderType    = useCartStore((s) => s.orderType)
  const setOrderType = useCartStore((s) => s.setOrderType)
  const clearCart    = useCartStore((s) => s.clearCart)

  const [loading,   setLoading]   = useState(false)
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const isEmpty = items.length === 0

  async function handleCheckout() {
    if (!customerName.trim()) {
      setNameError('Nama pelanggan wajib diisi')
      return
    }
    setNameError('')
    if (customerPhone && !/^[0-9+\-\s]{6,20}$/.test(customerPhone.trim())) {
      setPhoneError('Nomor telepon tidak valid')
      return
    }
    setPhoneError('')
    setLoading(true)

    try {
      const order = await orderService.createOrder({
        customer_name:  customerName.trim(),
        customer_phone: customerPhone.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        table_number:   tableNumber.trim() || undefined,
        order_type:     orderType,
        items: items.map((i) => ({ menu_id: i.id, qty: i.qty, ...(i.level ? { level: i.level } : {}) })),
      })
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

          {/* Customer info */}
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-4 space-y-4">
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
            <Input
              label="Nomor Telepon (opsional)"
              placeholder="Contoh: 08123456789"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value)
                if (phoneError) setPhoneError('')
              }}
              error={phoneError}
              fullWidth
            />
            <Input
              label="Email (opsional)"
              placeholder="Contoh: nama@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              fullWidth
            />
            <Input
              label="Nomor Meja (opsional)"
              placeholder="Contoh: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              fullWidth
            />

            {/* Order type toggle */}
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-2">Tipe Pesanan</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    orderType === 'dine_in'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-zinc-600 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  🍽️ Makan di Tempat
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    orderType === 'takeaway'
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-zinc-600 border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  🥡 Bawa Pulang
                </button>
              </div>
            </div>
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
