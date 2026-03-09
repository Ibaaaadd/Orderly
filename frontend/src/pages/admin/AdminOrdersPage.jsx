import React, { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import * as adminService from '../../services/adminService'
import { formatPrice } from '../../utils/formatPrice'

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  paid:      'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const STATUS_LABELS = {
  pending:   'Menunggu',
  paid:      'Lunas',
  cancelled: 'Dibatalkan',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getOrders()
      setOrders(res.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Auto-refresh every 30 seconds
    const timer = setInterval(load, 30_000)
    return () => clearInterval(timer)
  }, [load])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-surface-800">Pesanan</h1>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 border border-surface-300 text-surface-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="text-center py-16 text-surface-400">Memuat…</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">ID Pesanan</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Waktu</th>
                <th className="text-left px-4 py-3 font-semibold text-surface-600">Items</th>
                <th className="text-right px-4 py-3 font-semibold text-surface-600">Total</th>
                <th className="text-center px-4 py-3 font-semibold text-surface-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-surface-400">
                    Belum ada pesanan
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-surface-500">
                    #{order.id}
                  </td>
                  <td className="px-4 py-3 text-surface-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-surface-600">
                    {Array.isArray(order.items)
                      ? order.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-surface-800">
                    {formatPrice(Number(order.total_price))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                        ${STATUS_STYLES[order.status] ?? 'bg-surface-100 text-surface-600'}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
