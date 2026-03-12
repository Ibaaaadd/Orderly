import React from 'react'
import { Printer, X, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'

const STATUS_LABEL = { pending: 'Menunggu', paid: 'Lunas', cancelled: 'Dibatalkan' }
const ORDER_TYPE_LABEL = { dine_in: 'Makan di tempat', takeaway: 'Dibawa pulang' }

/** Escape HTML entities for use inside the print popup */
function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Receipt – modal preview + popup print for struk pesanan.
 * Uses window.open() so print output is always correct regardless of CSS bundling.
 */
export default function Receipt({ order, onClose }) {
  if (!order) return null

  const items = order.items ?? []

  function handlePrint() {
    const itemRows = items.map((item) => `
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;">
        <span style="flex:1;">${esc(item.name ?? item.menu_name ?? 'Item')} ×${item.qty ?? item.quantity ?? 1}${item.level ? ` <span style="font-size:11px;color:#888;">(Level ${esc(item.level)})</span>` : ''}</span>
        <span style="white-space:nowrap;">${formatPrice(Number(item.subtotal))}</span>
      </div>`).join('')

    const html = `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8"/>
  <title>Struk-Pesanan-${order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 13px; color: #000; padding: 20px; max-width: 300px; margin: 0 auto; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #bbb; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
    .small { font-size: 11px; color: #777; }
    .total { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin-top: 2px; }
    @media print { body { padding: 0; } }
  </style>
</head><body>
  <p class="center bold" style="font-size:17px;letter-spacing:3px;margin-bottom:3px;">ORDERLY</p>
  <p class="center small">Sistem POS Restoran</p>
  <p class="center small" style="margin-top:2px;">${new Date(order.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  <div class="divider"></div>
  <div class="row"><span>No. Pesanan</span><span class="bold">#${order.id}</span></div>
  <div class="row"><span>Pelanggan</span><span>${esc(order.customer_name)}</span></div>
  <div class="row"><span>Status</span><span>${esc(STATUS_LABEL[order.status] ?? order.status)}</span></div>
  ${order.order_type ? `<div class="row"><span>Tipe</span><span>${esc(ORDER_TYPE_LABEL[order.order_type] ?? order.order_type)}</span></div>` : ''}
  ${order.table_number ? `<div class="row"><span>No. Meja</span><span>${esc(String(order.table_number))}</span></div>` : ''}
  <div class="divider"></div>
  <p class="bold" style="margin-bottom:7px;">Item Pesanan</p>
  ${itemRows || '<p class="small">—</p>'}
  <div class="divider"></div>
  <div class="total"><span>TOTAL</span><span>${formatPrice(Number(order.total_price))}</span></div>
  ${order.payment_reference ? `<div class="divider"></div><div class="row small"><span>Ref. Bayar</span><span style="word-break:break-all;text-align:right;max-width:160px;">${esc(order.payment_reference)}</span></div>` : ''}
  <div class="divider"></div>
  <p class="center small" style="margin-top:10px;">Terima kasih telah memesan! 🍽</p>
</body></html>`

    const win = window.open('', '_blank', 'width=400,height=650,scrollbars=yes')
    if (!win) { alert('Popup diblokir. Izinkan popup untuk mencetak struk.'); return }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 350)
  }

  const StatusIcon = order.status === 'paid' ? CheckCircle2 : order.status === 'cancelled' ? XCircle : Clock
  const statusColor = order.status === 'paid' ? 'text-green-600 bg-green-50' : order.status === 'cancelled' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div>
            <p className="font-bold text-surface-800 text-base leading-tight">Struk Pesanan</p>
            <p className="text-xs text-surface-400 font-mono mt-0.5">#{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Printer size={14} /> Cetak
            </button>
            <button
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Preview body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {/* Brand header */}
          <div className="text-center mb-4 pb-4 border-b border-dashed border-zinc-200">
            <p className="font-black text-lg tracking-[0.2em] text-surface-900">ORDERLY</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Sistem POS Restoran</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {new Date(order.created_at).toLocaleString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>

          {/* Order info */}
          <div className="space-y-1.5 mb-4 pb-4 border-b border-dashed border-zinc-200 text-sm">
            <InfoRow label="No. Pesanan" value={<span className="font-mono font-bold">#{order.id}</span>} />
            <InfoRow label="Pelanggan"   value={order.customer_name} />
            <InfoRow label="Status"      value={
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                <StatusIcon size={11} />{STATUS_LABEL[order.status] ?? order.status}
              </span>
            } />
            {order.order_type && <InfoRow label="Tipe" value={ORDER_TYPE_LABEL[order.order_type] ?? order.order_type} />}
            {order.table_number && <InfoRow label="No. Meja" value={order.table_number} />}
          </div>

          {/* Items */}
          <p className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Item Pesanan</p>
          <div className="space-y-2 mb-4 pb-4 border-b border-dashed border-zinc-200">
            {items.length === 0
              ? <p className="text-sm text-surface-400">—</p>
              : items.map((item, i) => (
                <div key={i} className="flex justify-between gap-2 text-sm">
                  <span className="flex-1 text-surface-700">
                    {item.name ?? item.menu_name ?? 'Item'}
                    <span className="text-surface-400"> ×{item.qty ?? item.quantity}</span>
                    {item.level && <span className="ml-1 text-[11px] text-surface-400">(Level {item.level})</span>}
                  </span>
                  <span className="shrink-0 font-medium text-surface-800">{formatPrice(Number(item.subtotal))}</span>
                </div>
              ))
            }
          </div>

          {/* Total */}
          <div className="flex justify-between items-center text-base font-bold text-surface-900 mb-1">
            <span>TOTAL</span>
            <span className="text-primary-600 text-lg">{formatPrice(Number(order.total_price))}</span>
          </div>

          {order.payment_reference && (
            <div className="mt-3 pt-3 border-t border-dashed border-zinc-200">
              <InfoRow label="Ref. Bayar" value={<span className="font-mono text-[11px] break-all">{order.payment_reference}</span>} small />
            </div>
          )}

          <p className="text-center text-[11px] text-zinc-400 mt-4 pt-4 border-t border-dashed border-zinc-200">
            Terima kasih telah memesan!
          </p>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, small = false }) {
  return (
    <div className={`flex justify-between items-start gap-3 ${small ? 'text-xs' : 'text-sm'}`}>
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
