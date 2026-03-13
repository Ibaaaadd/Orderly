import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw, QrCode, Banknote, CheckCircle2 } from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import QRPayment from '../components/payment/QRPayment.jsx'
import PaymentStatus from '../components/payment/PaymentStatus.jsx'
import Button from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Loader.jsx'
import orderService from '../services/orderService.js'
import paymentService from '../services/paymentService.js'
import { useToast } from '../components/ui/Toast.jsx'
import { formatPrice } from '../utils/formatPrice.js'

const POLL_INTERVAL  = 5000
const PAYMENT_WINDOW = 600   // 10 minutes in seconds

function calcSecsLeft(createdAt) {
  if (!createdAt) return PAYMENT_WINDOW
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  return Math.max(0, PAYMENT_WINDOW - elapsed)
}

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const toast       = useToast()

  const [order,      setOrder]      = useState(null)
  const [payment,    setPayment]    = useState(null)
  const [method,     setMethod]     = useState(null)   // null | 'qris' | 'cash'
  const [pageStatus, setPageStatus] = useState('loading')
  const [secsLeft,   setSecsLeft]   = useState(PAYMENT_WINDOW)
  const pollRef  = useRef(null)
  const timerRef = useRef(null)

  // ── Load order on mount ─────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const res = await orderService.getOrder(orderId)
        const ord = res.data
        setOrder(ord)
        setSecsLeft(calcSecsLeft(ord.created_at))

        if (ord.status === 'paid') {
          navigate(`/success/${orderId}`, { replace: true })
          return
        }
        if (ord.status === 'cancelled') {
          setPageStatus('cancelled')
          return
        }
        // Cash already initiated but not yet confirmed
        if (ord.payment_reference?.startsWith('CASH')) {
          setMethod('cash')
          setPageStatus('cash_pending')
          return
        }
        // If a QRIS payment was already initiated, jump straight into QRIS flow
        if (ord.payment_reference && !ord.payment_reference.startsWith('CASH')) {
          const existing = await paymentService.createPayment(orderId) // idempotent
          setPayment(existing?.data || null)
          setMethod('qris')
          setPageStatus('ready')
          return
        }
        setPageStatus('method_select')
      } catch {
        toast.error('Gagal memuat data pembayaran')
        setPageStatus('error')
      }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // ── Countdown timer (QRIS only) ─────────────────────────────────
  useEffect(() => {
    if (!order?.created_at) return
    if (method !== 'qris') return
    if (['paid', 'cancelled', 'expired', 'cash', 'cash_pending', 'method_select'].includes(pageStatus)) return

    timerRef.current = setInterval(() => {
      const secs = calcSecsLeft(order.created_at)
      setSecsLeft(secs)
      if (secs <= 0) {
        clearInterval(timerRef.current)
        clearInterval(pollRef.current)
        if (order.status === 'pending') orderService.cancelOrder(orderId).catch(() => {})
        setPageStatus('expired')
      }
    }, 1000)

    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.created_at, pageStatus, method])

  // ── QRIS polling ────────────────────────────────────────────────
  useEffect(() => {
    if (pageStatus !== 'ready') return

    pollRef.current = setInterval(async () => {
      try {
        setPageStatus('checking')
        const res = await orderService.getOrder(orderId)
        const updated = res.data
        setOrder(updated)

        if (updated.status === 'paid') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setPageStatus('paid')
          setTimeout(() => navigate(`/success/${orderId}`), 1200)
        } else if (updated.status === 'cancelled') {
          clearInterval(pollRef.current)
          clearInterval(timerRef.current)
          setPageStatus('cancelled')
        } else {
          setPageStatus('ready')
        }
      } catch {
        setPageStatus('ready')
      }
    }, POLL_INTERVAL)

    return () => clearInterval(pollRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageStatus])

  // ── Select Cash ──────────────────────────────────────────────────
  async function handleSelectCash() {
    try {
      setMethod('cash')
      setPageStatus('cash') // brief loading
      await paymentService.createCashPayment(orderId)
      navigate('/orders')
    } catch {
      toast.error('Gagal memulai pembayaran tunai')
      setMethod(null)
      setPageStatus('method_select')
    }
  }

  // ── Select QRIS ──────────────────────────────────────────────────
  async function handleSelectQris() {
    try {
      setMethod('qris')
      setPageStatus('qris_loading')
      const payRes = await paymentService.createPayment(orderId)
      setPayment(payRes?.data || null)
      setPageStatus('ready')
    } catch {
      toast.error('Gagal membuat pembayaran QRIS')
      setMethod(null)
      setPageStatus('method_select')
    }
  }

  // ── Common loading ───────────────────────────────────────────────
  if (pageStatus === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size={40} />
      </div>
    )
  }

  if (pageStatus === 'error') {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-zinc-500">Gagal memuat halaman pembayaran.</p>
          <Button onClick={() => navigate('/')}>Kembali ke Menu</Button>
        </div>
      </Container>
    )
  }

  if (pageStatus === 'expired') {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-5 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⏰</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900">Waktu Pembayaran Habis</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Pesananmu otomatis dibatalkan karena melebihi 10 menit.
            </p>
          </div>
          <Button onClick={() => navigate('/')}>Pesan Ulang</Button>
        </motion.div>
      </Container>
    )
  }

  if (pageStatus === 'cancelled') {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-5 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
            <span className="text-3xl">❌</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900">Pesanan Dibatalkan</h2>
            <p className="text-sm text-zinc-500 mt-1">Pesanan ini sudah dibatalkan.</p>
          </div>
          <Button onClick={() => navigate('/')}>Kembali ke Menu</Button>
        </motion.div>
      </Container>
    )
  }

  // ── Method selector ──────────────────────────────────────────────
  if (pageStatus === 'method_select') {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 space-y-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl hover:bg-surface-100 transition-colors text-zinc-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900">Pilih Metode Pembayaran</h1>
              {order && (
                <p className="text-sm text-zinc-400">{order.customer_name} · #{orderId}</p>
              )}
            </div>
          </div>

          {order && (
            <div className="rounded-2xl bg-primary-50 border border-primary-100 px-5 py-4 text-center">
              <p className="text-xs text-primary-500 font-medium uppercase tracking-widest mb-1">Total Tagihan</p>
              <p className="text-3xl font-extrabold text-primary-700">{formatPrice(order.total_price)}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSelectQris}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-surface-200 bg-white hover:border-primary-400 hover:shadow-md transition-all text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center">
                <QrCode size={28} className="text-primary-600" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm">QRIS</p>
                <p className="text-xs text-zinc-400 mt-0.5">Scan & bayar digital</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSelectCash}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-surface-200 bg-white hover:border-emerald-400 hover:shadow-md transition-all text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Banknote size={28} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-zinc-900 text-sm">Tunai</p>
                <p className="text-xs text-zinc-400 mt-0.5">Bayar langsung kasir</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </Container>
    )
  }

  // ── Cash loading (brief) / cash_pending (already initiated) ─────
  if (pageStatus === 'cash' || pageStatus === 'cash_processing') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size={40} />
      </div>
    )
  }

  if (pageStatus === 'cash_pending') {
    return (
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-10 flex flex-col items-center gap-6 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Banknote size={30} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900">Menunggu Pembayaran Tunai</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Pesananmu sudah diterima. Konfirmasi bayar ada di halaman Riwayat Pesanan.
            </p>
          </div>
          {order && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4 w-full max-w-xs">
              <p className="text-xs text-emerald-600 font-medium mb-1">Total Tagihan</p>
              <p className="text-2xl font-extrabold text-emerald-700">{formatPrice(order.total_price)}</p>
            </div>
          )}
          <Button fullWidth onClick={() => navigate('/orders')}>
            Lihat Riwayat Pesanan
          </Button>
        </motion.div>
      </Container>
    )
  }

  // ── QRIS loading ─────────────────────────────────────────────────
  if (pageStatus === 'qris_loading') {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size={40} />
      </div>
    )
  }

  // ── QRIS flow ────────────────────────────────────────────────────
  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-5 space-y-5"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => { clearInterval(pollRef.current); clearInterval(timerRef.current); setMethod(null); setPayment(null); setPageStatus('method_select') }}
            className="p-2 rounded-xl hover:bg-surface-100 transition-colors text-zinc-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">Pembayaran QRIS</h1>
            {order && (
              <p className="text-sm text-zinc-400">
                {order.customer_name} · #{orderId}
              </p>
            )}
          </div>
        </div>

        <PaymentStatus
          status={
            pageStatus === 'checking' ? 'checking' :
            order?.status === 'paid'  ? 'paid'      :
            order?.status === 'cancelled' ? 'cancelled' :
            'pending'
          }
        />

        <QRPayment
          qrisUrl={payment?.qris_url}
          total={order?.total_price || 0}
          orderId={orderId}
          reference={payment?.reference_id}
          secsLeft={secsLeft}
        />

        <Button
          variant="ghost"
          fullWidth
          icon={<RefreshCw size={16} />}
          onClick={async () => {
            setPageStatus('checking')
            const res = await orderService.getOrder(orderId)
            setOrder(res.data)
            if (res.data.status === 'paid') {
              navigate(`/success/${orderId}`)
            } else {
              setPageStatus('ready')
            }
          }}
        >
          Cek Status Pembayaran
        </Button>
      </motion.div>
    </Container>
  )
}
