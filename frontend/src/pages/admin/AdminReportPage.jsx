import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import { TrendingUp, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import * as adminService from '../../services/adminService'
import DataTable from '../../components/ui/DataTable'

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function SummaryCard({ label, value, sub, highlight = false }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? 'bg-primary-50 border-primary-200' : 'bg-white border-surface-200 shadow-sm'}`}>
      <p className="text-xs font-medium text-surface-500 mb-1">{label}</p>
      <p className={`text-xl font-extrabold ${highlight ? 'text-primary-700' : 'text-surface-800'}`}>{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-3 py-2 text-xs space-y-1">
      <p className="font-bold text-surface-700">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'revenue'
            ? `Pendapatan: ${formatPrice(p.value)}`
            : p.name === 'paid_orders'
              ? `Lunas: ${p.value}`
              : `Dibatalkan: ${p.value}`
          }
        </p>
      ))}
    </div>
  )
}

const TABLE_COLUMNS = [
  {
    key: 'month', label: 'Bulan',
    render: (row) => MONTH_NAMES[row.month - 1],
  },
  {
    key: 'total_orders', label: 'Total Pesanan', headerClassName: 'text-right',
    className: 'text-right font-medium',
    render: (row) => row.total_orders,
  },
  {
    key: 'paid_orders', label: 'Lunas', headerClassName: 'text-right',
    className: 'text-right',
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        {row.paid_orders}
      </span>
    ),
  },
  {
    key: 'cancelled_orders', label: 'Dibatalkan', headerClassName: 'text-right',
    className: 'text-right',
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        {row.cancelled_orders}
      </span>
    ),
  },
  {
    key: 'revenue', label: 'Pendapatan (Lunas)', headerClassName: 'text-right',
    className: 'text-right font-bold text-primary-700',
    render: (row) => formatPrice(Number(row.revenue)),
  },
]

export default function AdminReportPage() {
  const [year, setYear]       = useState(new Date().getFullYear())
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getMonthlyReport(year)
      setData(
        res.data.map((r) => ({
          ...r,
          name: MONTH_SHORT[r.month - 1],
        }))
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [year])

  useEffect(() => { load() }, [load])

  // Aggregate totals
  const totals = data.reduce(
    (acc, r) => ({
      total_orders:     acc.total_orders     + r.total_orders,
      paid_orders:      acc.paid_orders      + r.paid_orders,
      cancelled_orders: acc.cancelled_orders + r.cancelled_orders,
      revenue:          acc.revenue          + r.revenue,
    }),
    { total_orders: 0, paid_orders: 0, cancelled_orders: 0, revenue: 0 }
  )

  const bestMonth = data.reduce(
    (best, r) => (r.revenue > best.revenue ? r : best),
    { revenue: 0, month: 0 }
  )

  function exportCSV() {
    const header = 'Bulan,Total Pesanan,Lunas,Dibatalkan,Pendapatan\n'
    const rows = data
      .map((r) => `${MONTH_NAMES[r.month - 1]},${r.total_orders},${r.paid_orders},${r.cancelled_orders},${r.revenue}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `laporan-keuangan-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
            <TrendingUp size={22} className="text-primary-600" />
            Laporan Keuangan
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Ringkasan bulanan tahun {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)} className="p-2 rounded-xl border border-surface-300 hover:bg-surface-50 text-surface-600">
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1.5 rounded-xl border border-surface-300 text-sm font-bold text-surface-700 min-w-[64px] text-center">
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= new Date().getFullYear()}
            className="p-2 rounded-xl border border-surface-300 hover:bg-surface-50 text-surface-600 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 border border-surface-300 text-surface-700 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={exportCSV}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Pendapatan"
          value={formatPrice(totals.revenue)}
          sub={`${totals.paid_orders} pesanan lunas`}
          highlight
        />
        <SummaryCard
          label="Total Pesanan"
          value={totals.total_orders}
          sub={`Dibatalkan: ${totals.cancelled_orders}`}
        />
        <SummaryCard
          label="Rata-rata / Bulan"
          value={formatPrice(totals.revenue / 12)}
          sub="Berdasarkan 12 bulan"
        />
        <SummaryCard
          label="Bulan Terbaik"
          value={bestMonth.month ? MONTH_NAMES[bestMonth.month - 1] : '—'}
          sub={bestMonth.month ? formatPrice(bestMonth.revenue) : 'Belum ada data'}
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
        <h2 className="font-bold text-surface-800 text-sm mb-4">Pendapatan per Bulan</h2>
        {loading ? (
          <div className="h-52 bg-surface-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#71717a' }}
                axisLine={false} tickLine={false} width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders line chart */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
        <h2 className="font-bold text-surface-800 text-sm mb-4">Jumlah Pesanan per Bulan</h2>
        {loading ? (
          <div className="h-52 bg-surface-100 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="paid_orders"      name="paid_orders"      stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="cancelled_orders" name="cancelled_orders" stroke="#f87171" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Detailed table */}
      <div>
        <h2 className="font-bold text-surface-800 text-sm mb-3">Detail per Bulan</h2>
        <DataTable
          columns={TABLE_COLUMNS}
          data={data.map((r) => ({ ...r, id: r.month }))}
          pageSize={12}
          loading={loading}
          emptyText="Belum ada data untuk tahun ini"
        />
      </div>
    </div>
  )
}
