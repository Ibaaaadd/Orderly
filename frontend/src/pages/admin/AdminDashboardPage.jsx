import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle2, XCircle,
  UtensilsCrossed, RefreshCw, ArrowRight, DollarSign, BarChart2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { formatPrice } from '../../utils/formatPrice'
import * as adminService from '../../services/adminService'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function StatCard({ icon: Icon, label, value, sub, color = 'primary', loading }) {
  const colorMap = {
    primary:  'bg-primary-50 text-primary-600 border-primary-100',
    green:    'bg-green-50 text-green-600 border-green-100',
    yellow:   'bg-yellow-50 text-yellow-600 border-yellow-100',
    red:      'bg-red-50 text-red-600 border-red-100',
    blue:     'bg-blue-50 text-blue-600 border-blue-100',
    violet:   'bg-violet-50 text-violet-600 border-violet-100',
  }
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-surface-500 mb-0.5">{label}</p>
        {loading
          ? <div className="h-7 w-24 bg-surface-200 rounded-lg animate-pulse" />
          : <p className="text-xl font-extrabold text-surface-800 truncate">{value}</p>
        }
        {sub && !loading && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-surface-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'revenue' ? formatPrice(p.value) : `${p.value} pesanan`}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [topMenus, setTopMenus] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const currentYear = new Date().getFullYear()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [sumRes, monRes, topRes] = await Promise.all([
        adminService.getReportSummary(),
        adminService.getMonthlyReport(currentYear),
        adminService.getTopMenus(5),
      ])
      setSummary(sumRes.data)
      setMonthly(
        monRes.data.map((r) => ({
          ...r,
          name: MONTH_SHORT[r.month - 1],
        }))
      )
      setTopMenus(topRes.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [currentYear])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-0.5">
            Ringkasan operasional — {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 border border-surface-300 text-surface-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign} label="Pendapatan Hari Ini" color="green" loading={loading}
          value={formatPrice(Number(summary?.revenue_today ?? 0))}
          sub={`${summary?.orders_today ?? 0} pesanan hari ini`}
        />
        <StatCard
          icon={TrendingUp} label="Pendapatan Bulan Ini" color="primary" loading={loading}
          value={formatPrice(Number(summary?.revenue_this_month ?? 0))}
          sub={`Total keseluruhan: ${formatPrice(Number(summary?.total_revenue ?? 0))}`}
        />
        <StatCard
          icon={Clock} label="Menunggu Pembayaran" color="yellow" loading={loading}
          value={summary?.orders_pending ?? '—'}
          sub="Perlu diproses"
        />
        <StatCard
          icon={CheckCircle2} label="Pesanan Lunas" color="green" loading={loading}
          value={summary?.orders_paid ?? '—'}
          sub={`Dibatalkan: ${summary?.orders_cancelled ?? 0}`}
        />
        <StatCard
          icon={ShoppingBag} label="Total Pesanan" color="blue" loading={loading}
          value={summary?.total_orders ?? '—'}
          sub="Semua status"
        />
        <StatCard
          icon={UtensilsCrossed} label="Menu Aktif" color="violet" loading={loading}
          value={summary?.active_menus ?? '—'}
          sub={`Total menu: ${summary?.total_menus ?? 0}`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue area chart */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-surface-800 text-sm">Pendapatan {currentYear}</h2>
            <Link
              to="/admin/reports"
              className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
            >
              Laporan lengkap <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="h-48 bg-surface-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: '#7c3aed' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Orders bar chart */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-surface-800 text-sm mb-4">Jumlah Pesanan {currentYear}</h2>
          {loading ? (
            <div className="h-48 bg-surface-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="paid_orders"      name="orders" fill="#7c3aed" radius={[4,4,0,0]} />
                <Bar dataKey="cancelled_orders" name="orders" fill="#fca5a5" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top menus */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-surface-800 text-sm">Top 5 Menu Terlaris</h2>
          <BarChart2 size={16} className="text-surface-400" />
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-surface-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : topMenus.length === 0 ? (
          <p className="text-sm text-surface-400 text-center py-6">Belum ada data penjualan</p>
        ) : (
          <div className="space-y-2">
            {topMenus.map((item, i) => {
              const max = parseInt(topMenus[0]?.total_qty ?? 1)
              const pct = Math.round((parseInt(item.total_qty) / max) * 100)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-surface-400 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-surface-700 truncate">{item.name ?? '—'}</span>
                      <span className="text-surface-500 shrink-0 ml-2">{item.total_qty} terjual</span>
                    </div>
                    <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-surface-600 w-24 text-right shrink-0">
                    {formatPrice(Number(item.total_revenue))}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/admin/orders',     label: 'Kelola Pesanan',  color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { to: '/admin/menus',      label: 'Kelola Menu',     color: 'bg-violet-50 text-violet-700 border-violet-100' },
          { to: '/admin/categories', label: 'Kelola Kategori', color: 'bg-pink-50 text-pink-700 border-pink-100' },
          { to: '/admin/reports',    label: 'Laporan Keuangan',color: 'bg-green-50 text-green-700 border-green-100' },
        ].map(({ to, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center justify-between p-4 rounded-2xl border font-semibold text-sm transition hover:shadow-sm ${color}`}
          >
            {label}
            <ArrowRight size={14} />
          </Link>
        ))}
      </div>
    </div>
  )
}
