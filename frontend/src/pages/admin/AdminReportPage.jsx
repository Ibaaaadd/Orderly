import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'
import {
  TrendingUp, Download, RefreshCw, ChevronLeft, ChevronRight,
  DollarSign, ShoppingCart, CheckCircle2, XCircle, Award, Activity,
  CalendarDays, ChevronDown,
} from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import * as adminService from '../../services/adminService'

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

/* ─── Summary Card ───────────────────────────────────────────────────── */
const CARD_THEMES = {
  primary: {
    wrap: 'bg-gradient-to-br from-primary-500 to-primary-700 border-transparent text-white',
    label: 'text-primary-100',
    value: 'text-white',
    sub: 'text-primary-200',
    iconWrap: 'bg-white/20',
    iconColor: 'text-white',
  },
  green: {
    wrap: 'bg-white border-emerald-200',
    label: 'text-surface-500',
    value: 'text-emerald-700',
    sub: 'text-surface-400',
    iconWrap: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  red: {
    wrap: 'bg-white border-red-200',
    label: 'text-surface-500',
    value: 'text-red-600',
    sub: 'text-surface-400',
    iconWrap: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  amber: {
    wrap: 'bg-white border-amber-200',
    label: 'text-surface-500',
    value: 'text-amber-700',
    sub: 'text-surface-400',
    iconWrap: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  zinc: {
    wrap: 'bg-white border-surface-200',
    label: 'text-surface-500',
    value: 'text-surface-800',
    sub: 'text-surface-400',
    iconWrap: 'bg-surface-100',
    iconColor: 'text-surface-500',
  },
}

function SummaryCard({ label, value, sub, icon: Icon, theme = 'zinc' }) {
  const c = CARD_THEMES[theme]
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${c.wrap}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-medium mb-1.5 ${c.label}`}>{label}</p>
          <p className={`text-2xl font-extrabold leading-tight truncate ${c.value}`}>{value}</p>
          {sub && <p className={`text-xs mt-1 ${c.sub}`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.iconWrap}`}>
            <Icon size={18} className={c.iconColor} />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Tooltip ────────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-2xl shadow-xl px-4 py-3 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-bold text-surface-700 border-b border-surface-100 pb-1.5 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-surface-600">
            {p.name === 'revenue'
              ? `Pendapatan: ${formatPrice(p.value)}`
              : p.name === 'paid_orders'
                ? `Lunas: ${p.value}`
                : `Dibatalkan: ${p.value}`
            }
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Daily tooltip ──────────────────────────────────────────────────── */
function DailyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-surface-200 rounded-2xl shadow-xl px-4 py-3 text-xs space-y-1.5 min-w-[140px]">
      <p className="font-bold text-surface-700 border-b border-surface-100 pb-1.5 mb-1">Hari ke-{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-surface-600">
            {p.name === 'revenue'
              ? `Pendapatan: ${formatPrice(p.value)}`
              : `Pesanan Lunas: ${p.value}`
            }
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── Daily drill-down panel ─────────────────────────────────────────── */
function DailyPanel({ month, year, onClose }) {
  const [daily, setDaily]       = useState([])
  const [loadingD, setLoadingD] = useState(true)
  const [errorD, setErrorD]     = useState('')

  useEffect(() => {
    let cancelled = false
    setLoadingD(true)
    setErrorD('')
    adminService.getDailyReport(year, month)
      .then((res) => { if (!cancelled) setDaily(res.data) })
      .catch((e) =>  { if (!cancelled) setErrorD(e.message) })
      .finally(()  => { if (!cancelled) setLoadingD(false) })
    return () => { cancelled = true }
  }, [year, month])

  const totalRev    = daily.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = daily.reduce((s, d) => s + d.paid_orders, 0)
  const activeDays  = daily.filter((d) => d.revenue > 0).length

  return (
    <div className="border-t border-surface-100 bg-surface-50/60">
      <div className="px-5 py-4">
        {/* sub-header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-primary-500" />
            <span className="font-bold text-sm text-surface-800">
              Detail Harian — {MONTH_NAMES[month - 1]} {year}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1 transition-colors"
          >
            <ChevronDown size={13} className="rotate-180" /> Tutup
          </button>
        </div>

        {errorD && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{errorD}</div>
        )}

        {/* mini stats */}
        {!loadingD && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-3 shadow-sm">
              <p className="text-[10px] text-surface-400 font-medium mb-0.5">Total Pendapatan</p>
              <p className="text-sm font-extrabold text-primary-700">{formatPrice(totalRev)}</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-3 shadow-sm">
              <p className="text-[10px] text-surface-400 font-medium mb-0.5">Pesanan Lunas</p>
              <p className="text-sm font-extrabold text-emerald-700">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-xl border border-surface-200 px-4 py-3 shadow-sm">
              <p className="text-[10px] text-surface-400 font-medium mb-0.5">Hari Aktif</p>
              <p className="text-sm font-extrabold text-surface-800">{activeDays} hari</p>
            </div>
          </div>
        )}

        {/* daily area chart */}
        {loadingD ? (
          <div className="h-40 bg-surface-200 rounded-xl animate-pulse mb-4" />
        ) : (
          <div className="bg-white rounded-xl border border-surface-200 p-4 mb-4 shadow-sm">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={daily} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false} tickLine={false}
                  interval={daily.length > 20 ? 4 : 1}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  axisLine={false} tickLine={false} width={38}
                />
                <Tooltip content={<DailyTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="revenue" name="revenue"
                  stroke="#22c55e" strokeWidth={2}
                  fill="url(#gradDaily)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* daily table */}
        {!loadingD && (
          <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100">
                  <th className="px-4 py-2.5 text-left font-semibold text-surface-600">Tanggal</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-surface-600">Pesanan Lunas</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-surface-600">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {daily.filter((d) => d.revenue > 0 || d.paid_orders > 0).map((d) => (
                  <tr key={d.day} className="border-b border-surface-50 hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-2 font-medium text-surface-700">
                      {String(d.day).padStart(2, '0')} {MONTH_NAMES[month - 1]} {year}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={9} /> {d.paid_orders}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-primary-700">{formatPrice(d.revenue)}</td>
                  </tr>
                ))}
                {daily.every((d) => d.revenue === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-surface-400">Tidak ada transaksi bulan ini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Chart tab labels ───────────────────────────────────────────────── */
const CHART_TABS = [
  { key: 'revenue', label: 'Pendapatan', icon: TrendingUp },
  { key: 'orders',  label: 'Pesanan',    icon: Activity   },
]

export default function AdminReportPage() {
  const [year, setYear]               = useState(new Date().getFullYear())
  const [data, setData]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [activeChart, setActiveChart] = useState('revenue')
  const [expandedMonth, setExpandedMonth] = useState(null)

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
  useEffect(() => { setExpandedMonth(null) }, [year])

  const totals = data.reduce(
    (acc, r) => ({
      total_orders:     acc.total_orders     + r.total_orders,
      paid_orders:      acc.paid_orders      + r.paid_orders,
      cancelled_orders: acc.cancelled_orders + r.cancelled_orders,
      revenue:          acc.revenue          + Number(r.revenue),
    }),
    { total_orders: 0, paid_orders: 0, cancelled_orders: 0, revenue: 0 }
  )

  const bestMonth = data.reduce(
    (best, r) => (Number(r.revenue) > best.revenue ? { ...r, revenue: Number(r.revenue) } : best),
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
    <div className="p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 flex items-center gap-2">
            <TrendingUp size={22} className="text-primary-600" />
            Laporan Keuangan
          </h1>
          <p className="text-sm text-surface-500 mt-0.5">Ringkasan pendapatan &amp; pesanan tahun {year}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Year navigator */}
          <div className="flex items-center gap-1 bg-white border border-surface-200 rounded-xl px-1 py-1 shadow-sm">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 text-sm font-bold text-surface-700 min-w-[52px] text-center">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <button
            onClick={load}
            disabled={loading}
            title="Refresh"
            className="p-2.5 rounded-xl border border-surface-200 bg-white text-surface-600 hover:bg-surface-50 shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={exportCSV}
            disabled={loading || data.length === 0}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <XCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm animate-pulse">
              <div className="h-3 bg-surface-200 rounded w-1/2 mb-3" />
              <div className="h-7 bg-surface-200 rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-surface-100 rounded w-1/3" />
            </div>
          ))
        ) : (
          <>
            <SummaryCard
              label="Total Pendapatan"
              value={formatPrice(totals.revenue)}
              sub={`dari ${totals.paid_orders} pesanan lunas`}
              icon={DollarSign}
              theme="primary"
            />
            <SummaryCard
              label="Total Pesanan"
              value={totals.total_orders}
              sub={`Dibatalkan: ${totals.cancelled_orders}`}
              icon={ShoppingCart}
              theme="zinc"
            />
            <SummaryCard
              label="Rata-rata / Bulan"
              value={formatPrice(Math.round(totals.revenue / 12))}
              sub="Berdasarkan 12 bulan"
              icon={Activity}
              theme="amber"
            />
            <SummaryCard
              label="Bulan Terbaik"
              value={bestMonth.month ? MONTH_NAMES[bestMonth.month - 1] : '—'}
              sub={bestMonth.month ? formatPrice(bestMonth.revenue) : 'Belum ada data'}
              icon={Award}
              theme={bestMonth.month ? 'green' : 'zinc'}
            />
          </>
        )}
      </div>

      {/* ── Charts (tabbed) ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-surface-100">
          <div className="flex gap-1">
            {CHART_TABS.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                onClick={() => setActiveChart(key)}
                className={[
                  'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-t-xl transition-all -mb-px border',
                  activeChart === key
                    ? 'bg-white border-surface-200 border-b-white text-primary-600'
                    : 'border-transparent text-surface-400 hover:text-surface-600',
                ].join(' ')}
              >
                <TabIcon size={13} />
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-surface-400 pr-1 pb-2">{year}</span>
        </div>

        {/* Chart body */}
        <div className="p-5 pt-4">
          {loading ? (
            <div className="h-56 bg-surface-100 rounded-xl animate-pulse" />
          ) : activeChart === 'revenue' ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#a1a1aa' }}
                  axisLine={false} tickLine={false} width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />
                <Area
                  type="monotone" dataKey="revenue" name="revenue"
                  stroke="#7c3aed" strokeWidth={2.5}
                  fill="url(#gradRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e4e4e7', strokeWidth: 1 }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => v === 'paid_orders' ? 'Lunas' : 'Dibatalkan'}
                />
                <Line
                  type="monotone" dataKey="paid_orders" name="paid_orders"
                  stroke="#22c55e" strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#22c55e', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone" dataKey="cancelled_orders" name="cancelled_orders"
                  stroke="#f87171" strokeWidth={2} strokeDasharray="5 4"
                  dot={{ r: 3, fill: '#f87171', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Detail table ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
          <h2 className="font-bold text-surface-800 text-sm">Pendapatan per Bulan</h2>
          <span className="text-xs text-surface-400">{year}</span>
        </div>

        {loading ? (
          <div className="divide-y divide-surface-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse">
                <div className="h-3.5 bg-surface-200 rounded w-24" />
                <div className="ml-auto h-3.5 bg-surface-100 rounded w-16" />
                <div className="h-3.5 bg-surface-100 rounded w-20" />
                <div className="h-3.5 bg-surface-200 rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {data.map((row) => {
              const isOpen = expandedMonth === row.month
              const hasTx  = row.paid_orders > 0
              return (
                <div key={row.month}>
                  <button
                    onClick={() => setExpandedMonth(isOpen ? null : row.month)}
                    className={[
                      'w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left transition-colors',
                      isOpen ? 'bg-primary-50' : 'hover:bg-surface-50',
                    ].join(' ')}
                  >
                    {/* Month name */}
                    <span className={`font-semibold w-28 ${isOpen ? 'text-primary-700' : 'text-surface-700'}`}>
                      {MONTH_NAMES[row.month - 1]}
                    </span>

                    {/* Paid orders badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={10} /> {row.paid_orders} pesanan
                    </span>

                    {/* Revenue */}
                    <span className={`ml-auto font-bold tabular-nums ${
                      hasTx ? (isOpen ? 'text-primary-700' : 'text-primary-600') : 'text-surface-300'
                    }`}>
                      {formatPrice(Number(row.revenue))}
                    </span>

                    {/* Expand caret */}
                    <ChevronDown
                      size={15}
                      className={`text-surface-400 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180 text-primary-500' : ''
                      }`}
                    />
                  </button>

                  {/* Daily drill-down */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`daily-${row.month}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <DailyPanel
                          month={row.month}
                          year={year}
                          onClose={() => setExpandedMonth(null)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
