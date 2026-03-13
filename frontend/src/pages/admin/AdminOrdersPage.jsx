import React, { useEffect, useState, useCallback } from 'react'
import { RefreshCw, Printer, Clock, CheckCircle2, XCircle, UtensilsCrossed, ShoppingBag, Users, FileSpreadsheet, CalendarDays, X, Banknote, LayoutGrid, Bike } from 'lucide-react'
import XLSX from 'xlsx-js-style'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import SelectDropdown from '../../components/ui/SelectDropdown'
import * as adminService from '../../services/adminService'
import paymentService from '../../services/paymentService'
import { formatPrice } from '../../utils/formatPrice'
import DataTable from '../../components/ui/DataTable'
import Receipt from '../../components/ui/Receipt'
import { toast } from '../../utils/swal'
import orderService from '../../services/orderService'

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border border-yellow-200',
  paid:      'bg-green-50 text-green-700 border border-green-200',
  ready:     'bg-blue-50 text-blue-700 border border-blue-200',
  completed: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
}

const STATUS_ICONS = {
  pending:   Clock,
  paid:      CheckCircle2,
  ready:     UtensilsCrossed,
  completed: CheckCircle2,
  cancelled: XCircle,
}

const STATUS_LABELS = {
  pending:   'Menunggu',
  paid:      'Lunas',
  ready:     'Siap Antar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const ORDER_TYPE_STYLES = {
  dine_in:  'bg-blue-50 text-blue-700 border border-blue-200',
  takeaway: 'bg-purple-50 text-purple-700 border border-purple-200',
}

const ORDER_TYPE_LABELS = {
  dine_in:  'Dine In',
  takeaway: 'Takeaway',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DateRangeInput = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    ref={ref}
    onClick={onClick}
    className="flex items-center gap-2.5 bg-white border border-surface-200 shadow-sm rounded-xl px-3.5 py-2 text-xs font-medium hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-150 h-9 min-w-[215px]"
  >
    <CalendarDays size={13} className="text-primary-500 shrink-0" />
    <span className={value ? 'text-surface-800' : 'text-surface-400 font-normal'}>
      {value || 'Filter tanggal...'}
    </span>
  </button>
))
DateRangeInput.displayName = 'DateRangeInput'

export default function AdminOrdersPage() {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [receipt, setReceipt]     = useState(null)
  const [loadingReceipt, setLoadingReceipt] = useState(null)
  const [confirmingId, setConfirmingId]     = useState(null)
  const [filterStatus, setFilterStatus]     = useState('')
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(10)
  const [search, setSearch]       = useState('')
  const [total, setTotal]         = useState(0)
  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate]      = dateRange
  const [exporting, setExporting] = useState(false)

  const buildParams = useCallback((overrides = {}) => ({
    ...(search       ? { search }                        : {}),
    ...(filterStatus ? { status: filterStatus }          : {}),
    ...(startDate    ? { date_from: fmtDate(startDate) } : {}),
    ...(endDate      ? { date_to:   fmtDate(endDate) }   : {}),
    ...overrides,
  }), [search, filterStatus, startDate, endDate])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await adminService.getOrders(buildParams({ page, limit: pageSize }))
      setOrders(res.data)
      setTotal(res.total)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, buildParams])

  async function handleExportExcel() {
    try {
      setExporting(true)
      const res = await adminService.getOrders(buildParams({ page: 1, limit: 99999 }))
      const rows = res.data ?? []

      const NCOLS      = 8
      const HEADERS    = ['No. Pesanan', 'Pelanggan', 'Tipe Order', 'No. Meja', 'Item Pesanan', 'Total (Rp)', 'Status', 'Waktu']
      const COL_WIDTHS = [13, 24, 14, 10, 48, 16, 14, 22]
      const COL_ALIGN  = ['center', 'left', 'center', 'center', 'left', 'right', 'center', 'center']

      const filterParts = []
      if (startDate)    filterParts.push(`Dari: ${startDate.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}`)
      if (endDate)      filterParts.push(`S/d: ${endDate.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}`)
      if (filterStatus) filterParts.push(`Status: ${STATUS_LABELS[filterStatus] ?? filterStatus}`)
      if (search)       filterParts.push(`Kata kunci: "${search}"`)
      const periodText = filterParts.length ? filterParts.join('   •   ') : 'Periode: Semua Data'
      const printedAt  = new Date().toLocaleString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })
      const grandTotal = rows.reduce((s, r) => s + Number(r.total_price), 0)

      // ── Palette (orange brand) ─────────────────────────────────
      const P = {
        // Orange brand
        OR1:   'EA580C',   // primary-600  — header bg, accents
        OR2:   'C2410C',   // primary-700  — border accent, grand total
        OR3:   '9A3412',   // primary-800  — grand total bg
        OR4:   'FFF7ED',   // primary-50   — stripe bg
        OR5:   'FFEDD5',   // primary-100  — info section bg
        OR6:   'FED7AA',   // primary-200  — info border
        // Neutral
        WHITE: 'FFFFFF',
        DARK:  '18181B',
        GRAY:  '71717A',
        LGRAY: 'F4F4F5',
        BORD:  'E4E4E7',
        // Status
        GREEN_BG: 'D1FAE5', GREEN_FG: '065F46',
        YLW_BG:   'FEF3C7', YLW_FG:   '92400E',
        RED_BG:   'FEE2E2', RED_FG:   '991B1B',
      }

      const side = (style, rgb) => ({ style, color: { rgb } })
      const ec   = (r, c) => XLSX.utils.encode_cell({ r, c })
      const ensure = (ref) => { if (!ws[ref]) ws[ref] = { t: 's', v: '' } }   // eslint-disable-line no-use-before-define
      const style  = (ref, s) => { ensure(ref); ws[ref].s = s }               // eslint-disable-line no-use-before-define

      // ── Row index constants ────────────────────────────────────
      const TITLE_R  = 0
      const SUB_R    = 1   // period / filter
      const INFO_R   = 2   // printed-at
      const SPACER_R = 3
      const HDR_R    = 4
      const DATA_R0  = 5
      const TOTAL_R  = DATA_R0 + rows.length

      const empty = Array(NCOLS).fill('')
      const aoa = [
        [`Laporan Pesanan - Orderly`,  ...Array(NCOLS - 1).fill('')],  // 0 title
        [periodText,                   ...Array(NCOLS - 1).fill('')],  // 1 period
        [`Dicetak: ${printedAt}  |  Jumlah pesanan: ${rows.length}`, ...Array(NCOLS - 1).fill('')], // 2
        empty,                                                          // 3 spacer
        HEADERS,                                                        // 4
        ...rows.map((r) => [
          `#${r.id}`,
          r.customer_name ?? '',
          ORDER_TYPE_LABELS[r.order_type] ?? r.order_type ?? '',
          r.table_number ?? '-',
          Array.isArray(r.items) ? r.items.map((i) => `${i.name} ×${i.quantity ?? i.qty}${i.level ? ` (Level ${i.level})` : ''}`).join(', ') : '',
          Number(r.total_price),
          STATUS_LABELS[r.status] ?? r.status,
          r.created_at ? new Date(r.created_at).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '',
        ]),
        [...Array(NCOLS - 3).fill(''), 'GRAND TOTAL', grandTotal, '', ''], // total row
      ]

      const ws = XLSX.utils.aoa_to_sheet(aoa)

      // Sheet meta
      ws['!cols']   = COL_WIDTHS.map((w) => ({ wch: w }))
      ws['!merges'] = [TITLE_R, SUB_R, INFO_R].map((r) => ({ s: { r, c: 0 }, e: { r, c: NCOLS - 1 } }))
      ws['!freeze'] = { xSplit: 0, ySplit: HDR_R + 1 }

      const nRows = aoa.length
      ws['!rows'] = Array.from({ length: nRows }, () => ({ hpx: 21 }))
      ws['!rows'][TITLE_R]  = { hpx: 36 }
      ws['!rows'][SUB_R]    = { hpx: 19 }
      ws['!rows'][INFO_R]   = { hpx: 17 }
      ws['!rows'][SPACER_R] = { hpx: 8  }
      ws['!rows'][HDR_R]    = { hpx: 26 }
      ws['!rows'][TOTAL_R]  = { hpx: 26 }

      // ── Title ──────────────────────────────────────────────────
      style('A1', {
        font:      { bold: true, sz: 16, color: { rgb: P.OR2 }, name: 'Calibri' },
        fill:      { patternType: 'solid', fgColor: { rgb: P.WHITE } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border:    { bottom: side('thin', P.BORD) },
      })
      for (let c = 1; c < NCOLS; c++) {
        style(ec(TITLE_R, c), { fill: { patternType: 'solid', fgColor: { rgb: P.WHITE } } })
      }

      // ── Subtitle & info ────────────────────────────────────────
      ;[SUB_R, INFO_R].forEach((r, i) => {
        const ref = ec(r, 0)
        style(ref, {
          font:      { sz: 9, italic: i === 0, color: { rgb: P.GRAY }, name: 'Calibri' },
          fill:      { patternType: 'solid', fgColor: { rgb: P.WHITE } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border:    {
            bottom: side('thin', i === 1 ? P.OR6 : P.BORD),
          },
        })
        for (let c = 1; c < NCOLS; c++) {
          style(ec(r, c), { fill: { patternType: 'solid', fgColor: { rgb: P.WHITE } } })
        }
      })

      // ── Header row ─────────────────────────────────────────────
      for (let c = 0; c < NCOLS; c++) {
        const ref = ec(HDR_R, c)
        ensure(ref)
        ws[ref].s = {
          font:      { bold: true, sz: 10, color: { rgb: P.WHITE }, name: 'Calibri' },
          fill:      { patternType: 'solid', fgColor: { rgb: P.OR1 } },
          alignment: { horizontal: COL_ALIGN[c], vertical: 'center' },
          border: {
            top:    side('medium', P.OR2),
            bottom: side('medium', P.OR2),
            left:   side(c === 0        ? 'medium' : 'thin', c === 0        ? P.OR2 : 'FFFFFF30'),
            right:  side(c === NCOLS-1  ? 'medium' : 'thin', c === NCOLS-1  ? P.OR2 : 'FFFFFF30'),
          },
        }
      }

      // ── Data rows ──────────────────────────────────────────────
      const STATUS_CELL = {
        paid:      { bg: P.GREEN_BG, fg: P.GREEN_FG },
        ready:     { bg: 'DBEAFE',   fg: '1E40AF'   },
        completed: { bg: 'E0E7FF',   fg: '3730A3'   },
        pending:   { bg: P.YLW_BG,  fg: P.YLW_FG  },
        cancelled: { bg: P.RED_BG,  fg: P.RED_FG  },
      }
      const totalData = rows.length
      const innerB    = side('thin', P.BORD)
      const leftEdge  = side('medium', P.OR2)
      const rightEdge = side('medium', P.OR2)
      const botEdge   = (last) => side(last ? 'medium' : 'thin', last ? P.OR2 : P.BORD)

      for (let ri = 0; ri < totalData; ri++) {
        const r       = DATA_R0 + ri
        const odd     = ri % 2 === 1
        const isLast  = ri === totalData - 1
        const rowBg   = odd ? P.OR4 : P.WHITE

        for (let c = 0; c < NCOLS; c++) {
          const ref        = ec(r, c)
          ensure(ref)
          const isCurrency = c === 5
          const isItems    = c === 4
          const isStatus   = c === 6
          const scell      = isStatus ? STATUS_CELL[rows[ri]?.status] : null

          ws[ref].s = {
            font: {
              sz:   9,
              bold: isCurrency,
              color: { rgb: isCurrency ? P.OR2 : scell ? scell.fg : P.DARK },
              name: 'Calibri',
            },
            fill:      { patternType: 'solid', fgColor: { rgb: scell ? scell.bg : rowBg } },
            alignment: { horizontal: isCurrency ? 'right' : COL_ALIGN[c], vertical: 'center', wrapText: isItems },
            border: {
              top:    innerB,
              bottom: botEdge(isLast),
              left:   c === 0        ? leftEdge  : innerB,
              right:  c === NCOLS-1  ? rightEdge : innerB,
            },
          }
          if (isCurrency) { ws[ref].t = 'n'; ws[ref].z = '#,##0' }
        }
      }

      // ── Grand total row ────────────────────────────────────────
      const gtLabelCol = NCOLS - 3   // col index 5 = Total
      for (let c = 0; c < NCOLS; c++) {
        const ref     = ec(TOTAL_R, c)
        ensure(ref)
        const isLabel = c === gtLabelCol - 1   // col 4: label "GRAND TOTAL"
        const isValue = c === gtLabelCol        // col 5: number
        ws[ref].s = {
          font:      { bold: true, sz: 11, color: { rgb: P.WHITE }, name: 'Calibri' },
          fill:      { patternType: 'solid', fgColor: { rgb: P.OR3 } },
          alignment: { horizontal: isLabel ? 'right' : isValue ? 'right' : 'center', vertical: 'center' },
          border: {
            top:    side('medium', P.OR3),
            bottom: side('medium', P.OR3),
            left:   side(c === 0        ? 'medium' : 'thin', c === 0        ? P.OR3 : 'FFFFFF20'),
            right:  side(c === NCOLS-1  ? 'medium' : 'thin', c === NCOLS-1  ? P.OR3 : 'FFFFFF20'),
          },
        }
        if (isValue) { ws[ref].t = 'n'; ws[ref].z = '#,##0' }
      }

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pesanan')
      const suffix = [fmtDate(startDate), fmtDate(endDate)].filter(Boolean).join('_sd_') || 'semua'
      XLSX.writeFile(wb, `pesanan_${suffix}.xlsx`, { cellStyles: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 30_000)
    return () => clearInterval(timer)
  }, [load])

  async function handleConfirmCash(orderId) {
    setConfirmingId(orderId)
    try {
      await paymentService.confirmCashPayment(orderId)
      await load()
    } catch {
      toast('Gagal konfirmasi pembayaran tunai', 'error')
    } finally {
      setConfirmingId(null)
    }
  }

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

  const columns = [
    {
      key: 'id', label: 'Pesanan',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-lg w-fit">
            #{row.id}
          </span>
          <span className="text-xs text-surface-400">{formatDate(row.created_at)}</span>
        </div>
      ),
    },
    {
      key: 'customer_name', label: 'Pelanggan',
      render: (row) => (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="font-semibold text-surface-800 text-sm">{row.customer_name}</span>
          <div className="flex flex-wrap items-center gap-1">
            {row.order_type && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium ${ORDER_TYPE_STYLES[row.order_type] ?? 'bg-surface-100 text-surface-600'}`}>
                {row.order_type === 'dine_in' ? <UtensilsCrossed size={10} /> : <ShoppingBag size={10} />}
                {ORDER_TYPE_LABELS[row.order_type] ?? row.order_type}
              </span>
            )}
            {row.table_number && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-surface-100 text-surface-600">
                <Users size={10} /> Meja {row.table_number}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'items', label: 'Item',
      className: 'max-w-[220px]',
      render: (row) => {
        if (!Array.isArray(row.items) || row.items.length === 0) return <span className="text-surface-300">—</span>
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-surface-500">
              {row.items.length} item
            </span>
            <span className="text-xs text-surface-400 truncate max-w-[200px]">
              {row.items.map((i) => `${i.name} ×${i.quantity ?? i.qty}`).join(', ')}
            </span>
          </div>
        )
      },
    },
    {
      key: 'total_price', label: 'Total',
      headerClassName: 'text-right',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <span className="font-bold text-surface-900 text-sm">{formatPrice(Number(row.total_price))}</span>
      ),
    },
    {
      key: 'status', label: 'Status',
      headerClassName: 'text-center',
      className: 'text-center',
      render: (row) => {
        const Icon = STATUS_ICONS[row.status] ?? Clock
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[row.status] ?? 'bg-surface-100 text-surface-600'}`}>
            <Icon size={11} />
            {STATUS_LABELS[row.status] ?? row.status}
          </span>
        )
      },
    },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Pesanan</h1>
          {(startDate || endDate) && (
            <p className="text-xs text-surface-400 mt-0.5">
              {startDate ? startDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '?'}
              {startDate && endDate && ' — '}
              {endDate ? endDate.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '?'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting || loading}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <FileSpreadsheet size={15} />
            {exporting ? 'Mengekspor...' : 'Export Excel'}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 border border-surface-300 text-surface-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-surface-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
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
          <div className="flex flex-wrap items-center gap-2">
            {/* Date range picker — fixed height wrapper prevents layout shift */}
            <div className="flex items-center gap-1.5 h-9">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => { setDateRange(update); setPage(1) }}
                customInput={<DateRangeInput />}
                dateFormat="dd MMM yyyy"
                monthsShown={2}
                popperPlacement="bottom-start"
                popperClassName="z-50"
                calendarClassName="shadow-xl"
                popperProps={{ strategy: 'fixed' }}
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => { setDateRange([null, null]); setPage(1) }}
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-surface-200 bg-white text-surface-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm shrink-0"
                  title="Reset filter tanggal"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            {/* Divider */}
            <div className="w-px h-6 bg-surface-200 shrink-0" />
            {/* Status filter dropdown */}
            <SelectDropdown
              searchable={false}
              allLabel="Semua Status"
              allIcon={<LayoutGrid size={13} />}
              value={filterStatus}
              onChange={(val) => { setFilterStatus(val); setPage(1) }}
              placeholder="Filter Status"
              options={[
                { value: 'pending',   label: 'Menunggu',   icon: <Clock size={13} />,           iconClass: 'text-yellow-500',  activeClass: 'bg-yellow-500 text-white border-yellow-500 shadow-sm',   listActiveClass: 'bg-yellow-50 text-yellow-700',  listHoverClass: 'hover:bg-yellow-50 hover:text-yellow-700' },
                { value: 'paid',      label: 'Lunas',      icon: <CheckCircle2 size={13} />,    iconClass: 'text-green-600',   activeClass: 'bg-green-600 text-white border-green-600 shadow-sm',    listActiveClass: 'bg-green-50 text-green-700',    listHoverClass: 'hover:bg-green-50 hover:text-green-700' },
                { value: 'ready',     label: 'Siap Antar', icon: <UtensilsCrossed size={13} />, iconClass: 'text-blue-500',    activeClass: 'bg-blue-500 text-white border-blue-500 shadow-sm',      listActiveClass: 'bg-blue-50 text-blue-700',      listHoverClass: 'hover:bg-blue-50 hover:text-blue-700' },
                { value: 'completed', label: 'Selesai',    icon: <Bike size={13} />,            iconClass: 'text-indigo-500',  activeClass: 'bg-indigo-500 text-white border-indigo-500 shadow-sm',  listActiveClass: 'bg-indigo-50 text-indigo-700',  listHoverClass: 'hover:bg-indigo-50 hover:text-indigo-700' },
                { value: 'cancelled', label: 'Dibatalkan', icon: <XCircle size={13} />,         iconClass: 'text-red-500',     activeClass: 'bg-red-500 text-white border-red-500 shadow-sm',        listActiveClass: 'bg-red-50 text-red-700',        listHoverClass: 'hover:bg-red-50 hover:text-red-700' },
              ]}
            />
          </div>
        }
        actions={(row) => (
          <div className="flex items-center gap-1.5">
            {row.status === 'pending' && row.payment_reference?.startsWith('CASH') && (
              <button
                onClick={() => handleConfirmCash(row.id)}
                disabled={confirmingId === row.id}
                title="Konfirmasi Pembayaran Tunai"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors disabled:opacity-40"
              >
                {confirmingId === row.id
                  ? <RefreshCw size={12} className="animate-spin" />
                  : <Banknote size={12} />}
                Konfirmasi Tunai
              </button>
            )}
            <button
              onClick={() => openReceipt(row)}
              disabled={loadingReceipt === row.id}
              title="Lihat & Cetak Struk"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-surface-200 text-surface-600 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-colors disabled:opacity-40"
            >
              {loadingReceipt === row.id
                ? <RefreshCw size={12} className="animate-spin" />
                : <Printer size={12} />}
              Struk
            </button>
          </div>
        )}
      />

      {receipt && (
        <Receipt order={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  )
}
