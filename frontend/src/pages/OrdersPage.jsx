import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ClipboardList, ChevronRight, RefreshCw, Phone, Mail, UtensilsCrossed, ShoppingBag } from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Spinner, SkeletonBox } from '../components/ui/Loader.jsx'
import { formatPrice } from '../utils/formatPrice.js'
import orderService from '../services/orderService.js'
import useFetch from '../hooks/useFetch.js'

/**
 * OrdersPage – lists all past orders with status badges.
 */
const statusVariant = {
  pending:   'warning',
  paid:      'success',
  cancelled: 'danger',
}

const statusLabel = {
  pending:   'Menunggu',
  paid:      'Lunas',
  cancelled: 'Dibatalkan',
}

function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-surface-100 space-y-2">
      <div className="flex justify-between">
        <SkeletonBox className="h-4 w-20" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBox className="h-3 w-32" />
      <SkeletonBox className="h-5 w-24" />
    </div>
  )
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useFetch(
    () => orderService.getAllOrders(),
    []
  )

  const orders = data?.data || []

  return (
    <Container>
      <div className="py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardList size={22} className="text-primary-500" />
            <h1 className="text-xl font-extrabold text-zinc-900">Riwayat Pesanan</h1>
          </div>
          <button
            onClick={refetch}
            className="p-2 rounded-xl hover:bg-surface-100 text-zinc-500 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <OrderSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-10 text-zinc-400">
            <p>Gagal memuat pesanan.</p>
            <button
              onClick={refetch}
              className="mt-3 text-primary-600 font-semibold text-sm hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <ClipboardList size={52} className="mb-4 opacity-30" />
            <p className="font-semibold text-zinc-500">Belum ada pesanan</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Pesan Sekarang
            </button>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() =>
                  order.status === 'pending'
                    ? navigate(`/payment/${order.id}`)
                    : navigate(`/success/${order.id}`)
                }
                className="bg-white rounded-2xl p-4 border border-surface-100 shadow-soft flex items-center gap-3 cursor-pointer hover:shadow-medium transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-zinc-700">
                      #{order.id}
                    </span>
                    <Badge variant={statusVariant[order.status] || 'default'}>
                      {statusLabel[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 mt-0.5 font-medium truncate">
                    {order.customer_name}
                  </p>
                  {/* Phone / Email */}
                  {order.customer_phone && (
                    <p className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5 truncate">
                      <Phone size={11} />
                      {order.customer_phone}
                    </p>
                  )}
                  {order.customer_email && (
                    <p className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5 truncate">
                      <Mail size={11} />
                      {order.customer_email}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-primary-600 font-bold text-sm">
                      {formatPrice(order.total_price)}
                    </span>
                    <div className="flex items-center gap-2">
                      {order.order_type === 'takeaway' ? (
                        <span className="flex items-center gap-0.5 text-xs text-zinc-400">
                          <ShoppingBag size={11} /> Bawa Pulang
                        </span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-xs text-zinc-400">
                          <UtensilsCrossed size={11} /> Dine In
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day:   '2-digit',
                          month: 'short',
                          year:  'numeric',
                          hour:  '2-digit',
                          minute:'2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-300 shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
