import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ShoppingBag, Clock, CheckCircle2,
  BookOpen, RefreshCw, ArrowRight, DollarSign, BarChart2,
  Tag, Award, CalendarDays, ListOrdered, ChefHat,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { formatPrice } from '../../utils/formatPrice'
import * as adminService from '../../services/adminService'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const RANK_STYLES = [
  'bg-amber-400 text-white',
  'bg-zinc-300 text-zinc-700',
  'bg-orange-300 text-white',
]

function StatCard({ icon: Icon, label, value, sub, color = 'primary', loading }) {
  const colorMap = {
    primary: { wrap: 'bg-primary-50 border-primary-100', icon: 'text-primary-600' },
    green:   { wrap: 'bg-green-50 border-green-100',     icon: 'text-green-600' },
    yellow:  { wrap: 'bg-yellow-50 border-yellow-100',   icon: 'text-yellow-600' },
    red:     { wrap: 'bg-red-50 border-red-100',         icon: 'text-red-600' },
    blue:    { wrap: 'bg-blue-50 border-blue-100',       icon: 'text-blue-600' },
    violet:  { wrap: 'bg-violet-50 border-violet-100',   icon: 'text-violet-600' },
  }
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
      <div className={`inline-flex p-2.5 rounded-xl border mb-3 ${c.wrap}`}>
        <Icon size={18} className={c.icon} />
      </div>
      <p className="text-xs font-medium text-surface-400 mb-1">{label}</p>
      {loading
        ? <div className="h-7 w-16 bg-surface-200 rounded-lg animate-pulse" />
        : <p className="text-2xl font-extrabold text-surface-900 leading-tight">{value}</p>
      }
      {sub && !loading && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-xl shadow-lg px-3 py-2.5 text-xs min-w-[130px]">
      <p className="font-semibold text-surface-600 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex justify-between gap-3" style={{ color: p.color }}>
          <span className="text-surface-500">
            {p.name === 'revenue' ? 'Pendapatan' : p.name === 'paid_orders' ? 'Lunas' : 'Dibatalkan'}
          </span>
          <span className="font-bold">{p.name === 'revenue' ? formatPrice(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [summary, setSummary]   = useState(null)
  const [monthly, setMonthly]   = useState([])
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
      setMonthly(monRes.data.map((r) => ({ ...r, name: MONTH_SHORT[r.month - 1] })))
      setTopMenus(topRes.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [currentYear])

  useEffect(() => { load() }, [load])

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1 flex items-center gap-1.5">
            <CalendarDays size={13} className="shrink-0" />
            {today}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-surface-200 text-surface-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors disabled:opacity-50 shadow-sm shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* ── Hero cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-xl"><DollarSign size={16} /></div>
              <span className="text-sm font-medium text-white/80">Pendapatan Hari Ini</span>
            </div>
            {loading
              ? <div className="h-9 w-40 bg-white/20 rounded-xl animate-pulse mb-1" />
              : <p className="text-3xl font-black tracking-tight mb-1">{formatPrice(Number(summary?.revenue_today ?? 0))}</p>
            }
            {!loading && <p className="text-sm text-white/70">{summary?.orders_today ?? 0} pesanan hari ini</p>}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-0 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-white/20 rounded-xl"><TrendingUp size={16} /></div>
              <span className="text-sm font-medium text-white/80">Pendapatan Bulan Ini</span>
            </div>
            {loading
              ? <div className="h-9 w-40 bg-white/20 rounded-xl animate-pulse mb-1" />
              : <p className="text-3xl font-black tracking-tight mb-1">{formatPrice(Number(summary?.revenue_this_month ?? 0))}</p>
            }
            {!loading && <p className="text-sm text-white/70">Total: {formatPrice(Number(summary?.total_revenue ?? 0))}</p>}
          </div>
        </div>
      </div>

      {/* ── Secondary stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock}        label="Menunggu"      color="yellow" loading={loading} value={summary?.orders_pending  ?? '—'} sub="Perlu diproses" />
        <StatCard icon={CheckCircle2} label="Pesanan Lunas" color="green"  loading={loading} value={summary?.orders_paid      ?? '—'} sub={`Batal: ${summary?.orders_cancelled ?? 0}`} />
        <StatCard icon={ShoppingBag}  label="Total Pesanan" color="blue"   loading={loading} value={summary?.total_orders     ?? '—'} sub="Semua status" />
        <StatCard icon={ChefHat}      label="Menu Aktif"    color="violet" loading={loading} value={summary?.active_menus     ?? '—'} sub={`Total: ${summary?.total_menus ?? 0} menu`} />
      </div>

      {/* ── Charts ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <div className="lg:col-span-3 bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-surface-800 text-sm">Pendapatan {currentYear}</h2>
              <p className="text-xs text-surface-400 mt-0.5">Per bulan (pesanan lunas)</p>
            </div>
            <Link to="/admin/reports" className="flex items-center gap-1 text-xs text-primary-600 font-semibold hover:underline">
              Laporan <ArrowRight size={11} />
            </Link>
          </div>
          {loading ? (
            <div className="h-52 bg-surface-100 rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => v >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}jt` : `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#7c3aed' }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="font-bold text-surface-800 text-sm">Pesanan {currentYear}</h2>
            <p className="text-xs text-surface-400 mt-0.5">Lunas vs Dibatalkan</p>
          </div>
          {loading ? (
            <div className="h-52 bg-surface-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={175}>
                <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={10} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="paid_orders"      name="paid_orders"      fill="#7c3aed" radius={[3,3,0,0]} />
                  <Bar dataKey="cancelled_orders" name="cancelled_orders" fill="#fca5a5" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 px-1">
                <span className="flex items-center gap-1.5 text-xs text-surface-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary-500 inline-block" />Lunas
                </span>
                <span className="flex items-center gap-1.5 text-xs text-surface-500">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-300 inline-block" />Dibatalkan
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Top menus */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-surface-800 text-sm">Top 5 Menu Terlaris</h2>
              <p className="text-xs text-surface-400 mt-0.5">Berdasarkan jumlah terjual</p>
            </div>
            <div className="p-2 bg-surface-100 rounded-xl">
              <Award size={14} className="text-surface-400" />
            </div>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 bg-surface-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : topMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-surface-400">
              <ChefHat size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Belum ada data penjualan</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {topMenus.map((item, i) => {
                const max = parseInt(topMenus[0]?.total_qty ?? 1)
                const pct = Math.round((parseInt(item.total_qty) / max) * 100)
                const barColor = i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-primary-400' : i === 2 ? 'bg-orange-300' : 'bg-primary-200'
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-black shrink-0 ${RANK_STYLES[i] ?? 'bg-surface-100 text-surface-500'}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline text-sm mb-1.5">
                        <span className="font-semibold text-surface-700 truncate pr-2">{item.name ?? '—'}</span>
                        <span className="text-xs text-surface-400 shrink-0">{item.total_qty}×</span>
                      </div>
                      <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-surface-700 w-24 text-right shrink-0">
                      {formatPrice(Number(item.total_revenue))}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 shadow-sm p-5">
          <h2 className="font-bold text-surface-800 text-sm mb-5">Menu Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/admin/orders',     label: 'Pesanan',  Icon: ListOrdered, from: 'from-blue-500',    to_: 'to-blue-600' },
              { to: '/admin/menus',      label: 'Menu',     Icon: BookOpen,    from: 'from-violet-500',  to_: 'to-violet-600' },
              { to: '/admin/categories', label: 'Kategori', Icon: Tag,         from: 'from-pink-500',    to_: 'to-rose-600' },
              { to: '/admin/reports',    label: 'Laporan',  Icon: BarChart2,   from: 'from-emerald-500', to_: 'to-teal-600' },
            ].map(({ to, label, Icon, from, to_ }) => (
              <Link
                key={to} to={to}
                className={`flex flex-col items-start justify-between p-4 rounded-2xl bg-gradient-to-br ${from} ${to_} text-white font-semibold text-sm transition hover:opacity-90 hover:shadow-md min-h-[90px]`}
              >
                <div className="p-2 bg-white/20 rounded-xl mb-2">
                  <Icon size={15} />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span>{label}</span>
                  <ArrowRight size={13} className="opacity-70" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
