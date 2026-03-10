import React, { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer, X } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'

const STATUS_LABEL = { pending: 'Menunggu', paid: 'Lunas', cancelled: 'Dibatalkan' }

/**
 * Receipt – printable struk pesanan.
 *
 * Props:
 *   order   – order object with .items array
 *   onClose – () => void
 */
export default function Receipt({ order, onClose }) {
  const printRef = useRef(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Struk-Pesanan-${order.id}`,
  })

  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 no-print">
          <h2 className="font-bold text-surface-800 text-base">Struk Pesanan #{order.id}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-primary-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
            >
              <Printer size={14} /> Cetak
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-surface-400 hover:text-surface-700 hover:bg-surface-100 rounded-xl"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Receipt body – this part is printed */}
        <div className="overflow-y-auto flex-1 p-2">
          <div ref={printRef} className="p-4 font-mono text-[13px] text-black">
            {/* Brand */}
            <div className="text-center mb-3">
              <p className="font-bold text-base tracking-wide">ORDERLY</p>
              <p className="text-[11px] text-zinc-500">Sistem POS Restoran</p>
              <p className="text-[11px] text-zinc-500">
                {new Date(order.created_at).toLocaleString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>

            <Divider />

            {/* Order info */}
            <Row label="No. Pesanan" value={`#${order.id}`} />
            <Row label="Pelanggan"   value={order.customer_name} />
            <Row
              label="Status"
              value={STATUS_LABEL[order.status] ?? order.status}
            />

            <Divider />

            {/* Items */}
            <p className="font-bold mb-1">Item Pesanan</p>
            {(order.items ?? []).map((item, i) => (
              <div key={i} className="flex justify-between mb-0.5">
                <span className="flex-1 truncate pr-2">
                  {item.name ?? item.menu_name ?? 'Item'} ×{item.qty ?? item.quantity}
                </span>
                <span className="shrink-0">
                  {formatPrice(Number(item.subtotal))}
                </span>
              </div>
            ))}

            <Divider />

            {/* Total */}
            <div className="flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span>{formatPrice(Number(order.total_price))}</span>
            </div>

            {order.payment_reference && (
              <>
                <Divider />
                <Row label="Ref. Bayar" value={order.payment_reference} small />
              </>
            )}

            <Divider />

            <p className="text-center text-[11px] text-zinc-400 mt-2">
              Terima kasih telah memesan!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-dashed border-zinc-300 my-2" />
}

function Row({ label, value, small = false }) {
  return (
    <div className={`flex justify-between ${small ? 'text-[11px]' : ''} mb-0.5`}>
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
