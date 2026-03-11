import React, { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Printer, Clock, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react'
import * as adminService from '../../services/adminService'
import { formatPrice } from '../../utils/formatPrice'
import DataTable from '../../components/ui/DataTable'
import Receipt from '../../components/ui/Receipt'
import { toast } from '../../utils/swal'
import orderService from '../../services/orderService'

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
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [receipt, setReceipt]     = useState(null)
  const [loadingReceipt, setLoadingReceipt] = useState(null)
  const [filterStatus, setFilterStatus]     = useState('')
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(10)
  const [search, setSearch]       = useState('')
  const [total, setTotal]         = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getOrders({
        page,
        limit: pageSize,
        ...(search       ? { search }              : {}),
        ...(filterStatus ? { status: filterStatus } : {}),
      })
      setOrders(res.data)
      setTotal(res.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, filterStatus])

  useEffect(() => {
    load()
    const timer = setInterval(load, 30_000)
    return () => clearInterval(timer)
  }, [load])

  async function openReceipt(order) {
    if (Array.isArray(order.items) && order.items.length > 0) {
      setReceipt(order)
      return
    }
    try {
      setLoadingReceipt(order.id)
      const res = await orderService.getOrder(order.id)
      setReceipt(res.data)
    } catch {
      toast('Gagal memuat detail pesanan', 'error')
    } finally {
      setLoadingReceipt(null)
    }
  }

  const STATUS_FILTERS = [
    { value: '',          label: 'Semua',     Icon: LayoutGrid,   active: 'bg-primary-600 text-white',                     inactive: 'bg-surface-100 text-surface-600 hover:bg-surface-200' },
    { value: 'pending',   label: 'Menunggu',  Icon: Clock,        active: 'bg-yellow-500 text-white',                      inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
    { value: 'paid',      label: 'Lunas',     Icon: CheckCircle2, active: 'bg-green-500 text-white',                       inactive: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { value: 'cancelled', label: 'Dibatalkan',Icon: XCircle,      active: 'bg-red-500 text-white',                         inactive: 'bg-red-50 text-red-600 hover:bg-red-100' },
  ]

  const columns = [
    {
      key: 'id', label: 'ID',
      className: 'font-mono text-xs text-surface-400',
      render: (row) => `#${row.id}`,
    },
    {
      key: 'customer_name', label: 'Pelanggan',
      className: 'font-medium text-surface-800',
    },
    {
      key: 'created_at', label: 'Waktu',
      className: 'text-surface-500 whitespace-nowrap',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'items', label: 'Item',
      className: 'text-surface-500 max-w-[200px]',
      render: (row) =>
        Array.isArray(row.items)
          ? <span className="truncate block">{row.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</span>
          : '—',
    },
    {
      key: 'total_price', label: 'Total',
      headerClassName: 'text-right',
      className: 'text-right font-semibold text-surface-800 whitespace-nowrap',
      render: (row) => formatPrice(Number(row.total_price)),
    },
    {
      key: 'status', label: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[row.status] ?? 'bg-surface-100 text-surface-600'}`}>
          {STATUS_LABELS[row.status] ?? row.status}
        </span>
      ),
    },
  ]

  return (
    <div className="p-6">
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

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        serverSide
        serverTotal={total}
        serverPage={page}
        onServerPageChange={setPage}
        onServerPageSizeChange={setPageSize}
        onServerSearch={setSearch}
        searchKeys={['customer_name']}
        emptyText="Belum ada pesanan"
        toolbar={
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map(({ value, label, Icon, active, inactive }) => (
              <button
                key={value}
                onClick={() => { setFilterStatus(value); setPage(1) }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filterStatus === value ? active : inactive
                }`}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>
        }
        actions={(row) => (
          <button
            onClick={() => openReceipt(row)}
            disabled={loadingReceipt === row.id}
            title="Lihat & Cetak Struk"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-surface-200 text-surface-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors disabled:opacity-40"
          >
            {loadingReceipt === row.id
              ? <RefreshCw size={12} className="animate-spin" />
              : <Printer size={12} />
            }
            Struk
          </button>
        )}
      />

      {receipt && (
        <Receipt order={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  )
}
