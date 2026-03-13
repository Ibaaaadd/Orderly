import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Home,
  ReceiptText,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import Button from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Loader.jsx'
import { formatPrice } from '../utils/formatPrice.js'
import orderService from '../services/orderService.js'

const PAGE_COPY = {
  paid: {
    eyebrow: 'Pembayaran terkonfirmasi',
    title: 'Pembayaran Berhasil',
    message: (name) => `Terima kasih, ${name}. Pesananmu sudah masuk ke dapur.`,
    badge: 'Lunas',
    badgeClass: 'border-emerald-200 bg-emerald-100 text-emerald-700',
    amountLabel: 'Total Dibayar',
    note: 'Simpan nomor pesanan ini untuk pengecekan status atau pengambilan.',
    panelClass: 'border-emerald-200/80 bg-emerald-50/80',
    glowClass: 'from-emerald-200 via-emerald-100 to-transparent',
    accentClass: 'text-emerald-600',
    Icon: CheckCircle2,
    iconWrapClass: 'border-emerald-200 bg-white text-emerald-600 shadow-[0_24px_70px_-36px_rgba(16,185,129,0.8)]',
    primaryLabel: 'Pesan Lagi',
    primaryIcon: Home,
    primaryAction: 'home',
    secondaryLabel: 'Lihat Riwayat',
    secondaryIcon: ClipboardList,
  },
  cancelled: {
    eyebrow: 'Status pesanan berubah',
    title: 'Pesanan Dibatalkan',
    message: (name) => `Maaf, ${name}. Pembayaran tidak diproses dan pesanan ini sudah dibatalkan.`,
    badge: 'Dibatalkan',
    badgeClass: 'border-rose-200 bg-rose-100 text-rose-700',
    amountLabel: 'Total Pesanan',
    note: 'Jika ini tidak sesuai, cek kembali riwayat pesanan atau buat pesanan baru.',
    panelClass: 'border-rose-200/80 bg-rose-50/80',
    glowClass: 'from-rose-200 via-rose-100 to-transparent',
    accentClass: 'text-rose-600',
    Icon: XCircle,
    iconWrapClass: 'border-rose-200 bg-white text-rose-600 shadow-[0_24px_70px_-36px_rgba(244,63,94,0.7)]',
    primaryLabel: 'Pesan Ulang',
    primaryIcon: RotateCcw,
    primaryAction: 'home',
    secondaryLabel: 'Lihat Riwayat',
    secondaryIcon: ClipboardList,
  },
  pending: {
    eyebrow: 'Pembayaran masih diproses',
    title: 'Menunggu Konfirmasi Pembayaran',
    message: (name) => `${name}, pembayaranmu belum terkonfirmasi. Cek ulang status beberapa saat lagi.`,
    badge: 'Menunggu',
    badgeClass: 'border-amber-200 bg-amber-100 text-amber-700',
    amountLabel: 'Total Tagihan',
    note: 'Halaman ini akan menampilkan ringkasan pesanan, tetapi status akhir tetap mengikuti data terbaru.',
    panelClass: 'border-amber-200/80 bg-amber-50/80',
    glowClass: 'from-amber-200 via-amber-100 to-transparent',
    accentClass: 'text-amber-600',
    Icon: Clock3,
    iconWrapClass: 'border-amber-200 bg-white text-amber-600 shadow-[0_24px_70px_-36px_rgba(245,158,11,0.7)]',
    primaryLabel: 'Cek Pembayaran',
    primaryIcon: ArrowRight,
    primaryAction: 'payment',
    secondaryLabel: 'Kembali ke Menu',
    secondaryIcon: Home,
  },
}

function formatStatus(orderStatus) {
  if (orderStatus === 'paid' || orderStatus === 'ready' || orderStatus === 'completed') return 'paid'
  if (orderStatus === 'cancelled') return 'cancelled'
  return 'pending'
}

function formatItemQuantity(item) {
  return item.qty ?? item.quantity ?? 1
}

export default function SuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService
      .getOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size={40} />
      </div>
    )
  }

  const paymentState = formatStatus(order?.status)
  const copy = PAGE_COPY[paymentState]
  const customerName = order?.customer_name || 'Pelanggan'
  const StatusIcon = copy.Icon
  const PrimaryIcon = copy.primaryIcon
  const SecondaryIcon = copy.secondaryIcon

  function handlePrimaryAction() {
    if (copy.primaryAction === 'payment' && order?.id) {
      navigate(`/payment/${order.id}`)
      return
    }

    navigate('/')
  }

  return (
    <Container className="relative overflow-hidden pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(255,255,255,0))]" />
      <div className={`pointer-events-none absolute left-1/2 top-8 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-gradient-to-br opacity-80 blur-3xl ${copy.glowClass}`} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="flex flex-col gap-6 py-8"
      >
        <section className={`relative overflow-hidden rounded-[2rem] border p-6 shadow-[0_28px_80px_-50px_rgba(24,24,27,0.35)] backdrop-blur ${copy.panelClass}`}>
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/60 blur-2xl" />

          <div className="relative flex flex-col items-center text-center gap-5">
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.08, 1] }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className={`rounded-[1.75rem] border p-5 ${copy.iconWrapClass}`}
              >
                <StatusIcon size={52} />
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0.45 }}
                animate={{ scale: 1.35, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }}
                className={`absolute inset-0 rounded-[1.75rem] bg-gradient-to-br ${copy.glowClass}`}
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500 backdrop-blur">
                <Sparkles size={12} className={copy.accentClass} />
                {copy.eyebrow}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-zinc-950">{copy.title}</h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  {copy.message(customerName)}
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 rounded-[1.5rem] border border-white/70 bg-white/85 p-4 text-left shadow-[0_18px_50px_-40px_rgba(24,24,27,0.45)] sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Order ID</p>
                <p className="mt-2 font-mono text-lg font-bold text-zinc-900">#{order?.id ?? orderId}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Status</p>
                <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-bold ${copy.badgeClass}`}>
                  {copy.badge}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">{copy.amountLabel}</p>
                <p className="mt-2 text-lg font-black text-zinc-900">{formatPrice(order?.total_price ?? 0)}</p>
              </div>
            </div>
          </div>
        </section>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-[1.75rem] border border-zinc-200/80 bg-white/95 shadow-[0_28px_80px_-56px_rgba(24,24,27,0.45)] backdrop-blur"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Ringkasan Pesanan</h2>
                <p className="mt-1 text-sm text-zinc-500">Periksa item dan nominal yang tercatat pada sistem.</p>
              </div>
              <div className="hidden rounded-2xl bg-zinc-50 p-3 text-zinc-400 sm:block">
                <ReceiptText size={18} />
              </div>
            </div>

            <div className="space-y-4 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoBlock label="Nama Pelanggan" value={customerName} />
                <InfoBlock label="Status Saat Ini" value={copy.badge} valueClass={copy.accentClass} />
              </div>

              <div className="rounded-[1.5rem] bg-zinc-50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm font-semibold text-zinc-700">
                  <span>Daftar Item</span>
                  <span>{order.items?.length ?? 0} menu</span>
                </div>

                {order.items?.length > 0 ? (
                  <div className="space-y-2.5">
                    {order.items.map((item, index) => (
                      <div key={item.id ?? `${item.name}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm shadow-[0_10px_35px_-28px_rgba(24,24,27,0.55)]">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-800">{item.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">{formatItemQuantity(item)} porsi</p>
                        </div>
                        <span className="shrink-0 font-semibold text-zinc-700">{formatPrice(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-zinc-500">Belum ada item yang tercatat untuk pesanan ini.</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-[1.5rem] border border-zinc-200 bg-white px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{copy.amountLabel}</p>
                  <p className="mt-1 text-xs text-zinc-500">{copy.note}</p>
                </div>
                <p className="text-xl font-black text-primary-600">{formatPrice(order.total_price)}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid w-full gap-3 sm:grid-cols-2">
          <Button
            fullWidth
            size="lg"
            onClick={handlePrimaryAction}
            icon={<PrimaryIcon size={18} />}
            className="shadow-[0_18px_40px_-24px_rgba(249,115,22,0.8)]"
          >
            {copy.primaryLabel}
          </Button>
          <Button
            variant={paymentState === 'pending' ? 'outline' : 'secondary'}
            fullWidth
            onClick={() => navigate('/orders')}
            icon={<SecondaryIcon size={18} />}
            size="lg"
          >
            {copy.secondaryLabel}
          </Button>
        </div>
      </motion.div>
    </Container>
  )
}

function InfoBlock({ label, value, valueClass = 'text-zinc-900' }) {
  return (
    <div className="rounded-[1.25rem] border border-zinc-200 bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${valueClass}`}>{value}</p>
    </div>
  )
}
