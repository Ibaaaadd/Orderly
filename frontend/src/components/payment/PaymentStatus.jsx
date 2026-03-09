import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'

/**
 * PaymentStatus – animated status indicator.
 *
 * Props:
 *  status – 'pending' | 'paid' | 'cancelled' | 'checking'
 */
const config = {
  pending: {
    icon:  <Clock size={32} className="text-yellow-500" />,
    bg:    'bg-yellow-50 border-yellow-200',
    text:  'Menunggu Pembayaran',
    sub:   'Silakan scan QR code untuk melanjutkan',
    color: 'text-yellow-700',
  },
  checking: {
    icon:  <Loader2 size={32} className="text-blue-500 animate-spin" />,
    bg:    'bg-blue-50 border-blue-200',
    text:  'Mengecek Pembayaran...',
    sub:   'Harap tunggu sebentar',
    color: 'text-blue-700',
  },
  paid: {
    icon:  <CheckCircle2 size={32} className="text-green-500" />,
    bg:    'bg-green-50 border-green-200',
    text:  'Pembayaran Berhasil!',
    sub:   'Pesanan kamu sedang diproses',
    color: 'text-green-700',
  },
  cancelled: {
    icon:  <XCircle size={32} className="text-red-500" />,
    bg:    'bg-red-50 border-red-200',
    text:  'Pembayaran Dibatalkan',
    sub:   'Silakan buat pesanan baru',
    color: 'text-red-700',
  },
}

export default function PaymentStatus({ status = 'pending' }) {
  const c = config[status] || config.pending

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={['w-full flex items-center gap-4 p-4 rounded-2xl border', c.bg].join(' ')}
    >
      {c.icon}
      <div>
        <p className={['font-bold text-sm', c.color].join(' ')}>{c.text}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{c.sub}</p>
      </div>
    </motion.div>
  )
}
