import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Home, ClipboardList } from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Loader.jsx'
import { formatPrice } from '../utils/formatPrice.js'
import orderService from '../services/orderService.js'

/**
 * SuccessPage – shown after successful payment.
 * Displays order confirmation with a celebratory animation.
 */
export default function SuccessPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size={40} />
      </div>
    )
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col items-center text-center py-12 gap-6"
      >
        {/* Success icon with pulse ring */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-green-100 rounded-full p-6"
          >
            <CheckCircle2 size={56} className="text-green-500" />
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            className="absolute inset-0 bg-green-200 rounded-full"
          />
        </div>

        {/* Message */}
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-900">Pembayaran Berhasil!</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Terima kasih, {order?.customer_name || 'Pelanggan'} 🎉
          </p>
        </div>

        {/* Order summary card */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white rounded-2xl shadow-soft border border-surface-100 p-5 text-left space-y-3"
          >
            <h2 className="font-bold text-zinc-700 text-sm">Detail Pesanan</h2>

            <div className="flex justify-between text-sm text-zinc-500">
              <span>Order ID</span>
              <span className="font-mono font-bold text-zinc-700">#{order.id}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Status</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                LUNAS
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-800">
              <span>Total Bayar</span>
              <span className="text-primary-600">{formatPrice(order.total_price)}</span>
            </div>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="pt-2 border-t border-surface-100 space-y-1.5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-zinc-500">
                    <span>{item.name} × {item.qty}</span>
                    <span>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/')}
            icon={<Home size={18} />}
          >
            Pesan Lagi
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/orders')}
            icon={<ClipboardList size={18} />}
          >
            Lihat Riwayat
          </Button>
        </div>
      </motion.div>
    </Container>
  )
}
