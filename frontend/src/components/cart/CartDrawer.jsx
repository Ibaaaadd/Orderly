import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/cartStore.js'
import CartItem from './CartItem.jsx'
import CartSummary from './CartSummary.jsx'
import Modal from '../ui/Modal.jsx'
import Input from '../ui/Input.jsx'
import orderService from '../../services/orderService.js'
import { useToast } from '../ui/Toast.jsx'

/**
 * CartDrawer – slides in from the right.
 * Cart items + summary are shown immediately.
 * All customer detail fields live in a checkout modal
 * that appears only when the user taps "Bayar Sekarang".
 */
export default function CartDrawer() {
  const navigate = useNavigate()
  const toast    = useToast()

  const isOpen       = useCartStore((s) => s.isOpen)
  const items        = useCartStore((s) => s.items)
  const total        = useCartStore((s) => s.total)
  const customerName = useCartStore((s) => s.customerName)
  const setCustomerName  = useCartStore((s) => s.setCustomerName)
  const customerPhone    = useCartStore((s) => s.customerPhone)
  const setCustomerPhone = useCartStore((s) => s.setCustomerPhone)
  const tableNumber      = useCartStore((s) => s.tableNumber)
  const setTableNumber   = useCartStore((s) => s.setTableNumber)
  const orderType        = useCartStore((s) => s.orderType)
  const setOrderType     = useCartStore((s) => s.setOrderType)
  const closeCart    = useCartStore((s) => s.closeCart)
  const clearCart    = useCartStore((s) => s.clearCart)

  const [modalOpen,  setModalOpen]  = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [nameError,  setNameError]  = useState('')
  const [phoneError, setPhoneError] = useState('')

  const isEmpty = items.length === 0

  function openCheckoutModal() {
    setNameError('')
    setPhoneError('')
    setModalOpen(true)
  }

  async function handleConfirmOrder() {
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
        table_number:   tableNumber.trim() || undefined,
        order_type:     orderType,
        items: items.map((i) => ({ menu_id: i.id, qty: i.qty, ...(i.level ? { level: i.level } : {}) })),
      })
      clearCart()
      closeCart()
      setModalOpen(false)
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

            {/* Body – items list */}
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

            {/* Footer – summary + checkout button only */}
            {!isEmpty && (
              <div className="px-5 py-5 border-t border-surface-100">
                <CartSummary
                  total={total}
                  onCheckout={openCheckoutModal}
                  loading={false}
                  disabled={false}
                />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Checkout detail modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !loading && setModalOpen(false)}
        title="Detail Pesanan"
        size="sm"
      >
        <div className="space-y-4">
          {/* Customer name */}
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

          {/* Phone */}
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

          {/* Table number – only shown for dine in */}
          {orderType === 'dine_in' && (
            <Input
              label="Nomor Meja (opsional)"
              placeholder="Contoh: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              fullWidth
            />
          )}

          {/* Order type */}
          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-1.5">Tipe Pesanan</p>
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
                <UtensilsCrossed size={13} className="inline mr-1 -mt-0.5" />
                Makan di Tempat
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
                <ShoppingBag size={13} className="inline mr-1 -mt-0.5" />
                Bawa Pulang
              </button>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold py-3 rounded-2xl transition-colors mt-1"
          >
            {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
          </button>
        </div>
      </Modal>
    </>,
    document.body
  )
}
