import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { formatPrice } from '../../utils/formatPrice.js'
import { AlertCircle } from 'lucide-react'

/**
 * QRPayment – displays QRIS QR code and payment instructions.
 *
 * Props:
 *  qrisUrl   – string (data URL or string to encode)
 *  total     – number
 *  orderId   – string | number
 *  reference – string (payment reference ID)
 */
export default function QRPayment({ qrisUrl, total, orderId, reference }) {
  return (
    <div className="flex flex-col items-center gap-5">
      {/* QR Code box */}
      <div className="bg-white rounded-3xl p-5 shadow-medium border border-surface-100">
        {qrisUrl ? (
          <QRCodeSVG
            value={qrisUrl}
            size={220}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: '/favicon.svg',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        ) : (
          <div className="w-[220px] h-[220px] flex items-center justify-center bg-surface-100 rounded-2xl">
            <p className="text-sm text-zinc-400">QR tidak tersedia</p>
          </div>
        )}
      </div>

      {/* Order info */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Order ID</span>
          <span className="font-mono font-semibold text-zinc-700">#{orderId}</span>
        </div>
        {reference && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Referensi</span>
            <span className="font-mono text-xs text-zinc-600 break-all text-right max-w-[180px]">
              {reference}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold">
          <span className="text-zinc-700">Total Pembayaran</span>
          <span className="text-primary-600 text-base">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700 space-y-1">
          <p className="font-semibold">Cara Pembayaran QRIS</p>
          <ol className="list-decimal list-inside space-y-0.5 text-xs leading-relaxed">
            <li>Buka aplikasi e-wallet atau mobile banking</li>
            <li>Pilih menu Scan / QRIS</li>
            <li>Arahkan kamera ke QR di atas</li>
            <li>Konfirmasi nominal pembayaran</li>
            <li>Selesaikan pembayaran</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
