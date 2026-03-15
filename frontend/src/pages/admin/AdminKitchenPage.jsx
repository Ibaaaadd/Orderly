import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChefHat, Clock, RefreshCw, CheckCircle2, Utensils,
  Package, AlertCircle, Wifi, WifiOff, Bike,
} from 'lucide-react'
import api from '../../services/api.js'
import { formatPrice } from '../../utils/formatPrice.js'

const REFRESH_INTERVAL = 20_000 // 20 seconds

/**
 * Returns elapsed time string relative to now.
 * e.g. "2 mnt", "15 mnt", "1 jam 3 mnt"
 */
function elapsedLabel(dateStr) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60)   return `${secs} dtk`
  const mins = Math.floor(secs / 60)
  if (mins < 60)   return `${mins} mnt`
  const hrs  = Math.floor(mins / 60)
  const rem  = mins % 60
  return rem > 0 ? `${hrs} jam ${rem} mnt` : `${hrs} jam`
}

/**
 * Returns Tailwind color classes based on wait time (minutes).
 */
function urgencyClasses(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 5)  return { card: 'border-emerald-200 bg-white', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', glow: '' }
  if (mins < 10) return { card: 'border-amber-200 bg-amber-50', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', glow: 'shadow-amber-100' }
  return { card: 'border-red-200 bg-red-50', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', glow: 'shadow-red-100' }
}

function normalizePackageSelections(item) {
  const value = item?.package_selections
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function OrderCard({ order, onMarkReady, onMarkCompleted, isMarking }) {
  const [elapsed, setElapsed] = useState(() => elapsedLabel(order.created_at))
  const cls = urgencyClasses(order.created_at)
  const isReadyStatus = order.status === 'ready'

  // Tick elapsed time every 10s for live updates
  useEffect(() => {
    if (isReadyStatus) return
    const t = setInterval(() => setElapsed(elapsedLabel(order.created_at)), 10_000)
    return () => clearInterval(t)
  }, [order.created_at, isReadyStatus])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`rounded-2xl border-2 ${cls.card} ${cls.glow ? `shadow-lg ${cls.glow}` : 'shadow-sm'} overflow-hidden`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-current/10 border-surface-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${cls.dot}`} />
          <span className="font-extrabold text-zinc-900 text-base">#{order.id}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls.badge}`}>
            {elapsed}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {order.order_type === 'takeaway' ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              <Package size={11} /> Bawa Pulang
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              <Utensils size={11} /> Meja {order.table_number || '—'}
            </span>
          )}
        </div>
      </div>

      {/* Customer name */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-xs text-zinc-400 font-medium">Pelanggan</p>
        <p className="text-sm font-bold text-zinc-800 leading-tight">{order.customer_name}</p>
      </div>

      {/* Items list */}
      <div className="px-4 pb-3 mt-2 space-y-1.5">
        {(order.items || []).map((item, i) => (
          <div key={i} className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-surface-100 text-zinc-700 text-xs font-extrabold flex items-center justify-center">
                {item.quantity || item.qty}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-800 truncate leading-tight">
                  {item.name}
                </p>
                {item.level && (
                  <p className="text-xs text-zinc-400">Level {item.level}</p>
                )}

                {normalizePackageSelections(item).length > 0 && (
                  <div className="mt-1 space-y-1">
                    {normalizePackageSelections(item).map((selection) => (
                      <p
                        key={selection.id || `${selection.menu_id}-${selection.menu_name}-${selection.qty}`}
                        className="text-xs text-zinc-500 leading-tight"
                      >
                        ↳ {selection.menu_name || 'Item Paket'}
                        {selection.selected_level ? ` (Level ${selection.selected_level})` : ''}
                        <span className="text-zinc-400"> ×{selection.qty ?? 1}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      {!isReadyStatus && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onMarkReady(order.id)}
            disabled={isMarking}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isMarking ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <CheckCircle2 size={16} />
            )}
            Siap Disajikan
          </button>
        </div>
      )}

      {/* Ready stamp + deliver button */}
      {isReadyStatus && (
        <div className="px-4 pb-4 space-y-2">
          <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
            <CheckCircle2 size={16} />
            Sudah Siap
          </div>
          <button
            onClick={() => onMarkCompleted(order.id)}
            disabled={isMarking}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {isMarking ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <Bike size={16} />
            )}
            Sudah Diantar
          </button>
        </div>
      )}
    </motion.div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="text-sm font-mono text-zinc-500">
      {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

export default function AdminKitchenPage() {
  const [queueOrders,  setQueueOrders]  = useState([])  // status = paid
  const [doneOrders,   setDoneOrders]   = useState([])  // status = ready
  const [deliveredCount, setDeliveredCount] = useState(0) // status = completed today
  const [loading,      setLoading]      = useState(true)
  const [markingId,    setMarkingId]    = useState(null)
  const [lastRefresh,  setLastRefresh]  = useState(null)
  const [online,       setOnline]       = useState(true)
  const [activeTab,    setActiveTab]    = useState('queue') // queue | done
  const timerRef = useRef(null)

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    try {
      const [paidRes, readyRes, completedRes] = await Promise.all([
        api.get('/orders', { params: { status: 'paid', date_from: today, date_to: today, limit: 200 } }),
        api.get('/orders', { params: { status: 'ready', date_from: today, date_to: today, limit: 100 } }),
        api.get('/orders', { params: { status: 'completed', date_from: today, date_to: today, limit: 1 } }),
      ])
      setQueueOrders(paidRes.data || [])
      setDoneOrders(readyRes.data || [])
      setDeliveredCount(completedRes.total ?? (completedRes.data?.length ?? 0))
      setLastRefresh(new Date())
      setOnline(true)
    } catch {
      setOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial load + auto-refresh
  useEffect(() => {
    fetchOrders()
    timerRef.current = setInterval(() => fetchOrders(true), REFRESH_INTERVAL)
    return () => clearInterval(timerRef.current)
  }, [fetchOrders])

  async function handleMarkReady(orderId) {
    setMarkingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/ready`)
      // Move from queue to done locally for instant feedback
      setQueueOrders((prev) => prev.filter((o) => o.id !== orderId))
      setDoneOrders((prev) => {
        const order = queueOrders.find((o) => o.id === orderId)
        if (!order) return prev
        return [{ ...order, status: 'ready' }, ...prev]
      })
    } catch {
      // Re-fetch to sync state
      fetchOrders(true)
    } finally {
      setMarkingId(null)
    }
  }

  async function handleMarkCompleted(orderId) {
    setMarkingId(orderId)
    try {
      await api.patch(`/orders/${orderId}/complete`)
      setDoneOrders((prev) => prev.filter((o) => o.id !== orderId))
      setDeliveredCount((c) => c + 1)
    } catch {
      fetchOrders(true)
    } finally {
      setMarkingId(null)
    }
  }

  const queueCount = queueOrders.length
  const doneCount  = doneOrders.length

  return (
    <div className="min-h-screen bg-surface-50 text-surface-800">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-surface-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 rounded-xl p-2">
              <ChefHat size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-surface-800">Kitchen Display</h1>
              <p className="text-xs text-surface-500 leading-none">Order List</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live clock */}
            <LiveClock />

            {/* Online indicator */}
            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${online ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-600'}`}>
              {online ? <Wifi size={12} /> : <WifiOff size={12} />}
              {online ? 'Live' : 'Offline'}
            </span>

            {/* Last refresh */}
            {lastRefresh && (
              <span className="text-xs text-surface-500 hidden sm:block">
                Diperbarui {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}

            {/* Manual refresh */}
            <button
              onClick={() => fetchOrders()}
              className="p-2 rounded-xl hover:bg-surface-100 transition-colors text-surface-500 hover:text-surface-700"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-2xl bg-white border border-surface-200 p-4 text-center shadow-soft">
            <p className="text-3xl font-extrabold text-orange-400">{queueCount}</p>
            <p className="text-xs text-surface-500 mt-0.5 font-medium">Antrian Masak</p>
          </div>
          <div className="rounded-2xl bg-white border border-surface-200 p-4 text-center shadow-soft">
            <p className="text-3xl font-extrabold text-emerald-400">{doneCount}</p>
            <p className="text-xs text-surface-500 mt-0.5 font-medium">Siap Antar</p>
          </div>
          <div className="rounded-2xl bg-white border border-surface-200 p-4 text-center shadow-soft">
            <p className="text-3xl font-extrabold text-blue-400">{deliveredCount}</p>
            <p className="text-xs text-surface-500 mt-0.5 font-medium">Sudah Diantar</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-surface-200 rounded-2xl p-1 mb-5">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'queue'
                ? 'bg-orange-500 text-white shadow'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
            }`}
          >
            <Clock size={16} />
            Antrian
            {queueCount > 0 && (
              <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === 'queue' ? 'bg-white/20' : 'bg-orange-100 text-orange-700'}`}>
                {queueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'done'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
            }`}
          >
            <CheckCircle2 size={16} />
            Selesai
            {doneCount > 0 && (
              <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-full ${activeTab === 'done' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-700'}`}>
                {doneCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading && queueOrders.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border-2 border-surface-200 bg-white animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {activeTab === 'queue' && (
              <motion.div
                key="queue"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {queueOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 gap-4 text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <ChefHat size={36} className="text-surface-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-surface-700">Tidak ada antrian</p>
                      <p className="text-sm text-surface-500 mt-1">Semua pesanan sudah diproses</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {queueOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onMarkReady={handleMarkReady}
                          isMarking={markingId === order.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {doneOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 gap-4 text-center"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center">
                      <CheckCircle2 size={36} className="text-surface-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-surface-700">Belum ada pesanan selesai</p>
                      <p className="text-sm text-surface-500 mt-1">Pesanan yang sudah siap akan muncul di sini</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-80">
                    <AnimatePresence>
                      {doneOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onMarkReady={handleMarkReady}
                          onMarkCompleted={handleMarkCompleted}
                          isMarking={markingId === order.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
