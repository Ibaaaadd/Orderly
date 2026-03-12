import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Container from '../components/layout/Container.jsx'
import QRPayment from '../components/payment/QRPayment.jsx'
import PaymentStatus from '../components/payment/PaymentStatus.jsx'
import Button from '../components/ui/Button.jsx'
import { Spinner } from '../components/ui/Loader.jsx'
import orderService from '../services/orderService.js'
import paymentService from '../services/paymentService.js'
import { useToast } from '../components/ui/Toast.jsx'

const POLL_INTERVAL  = 5000  // ms
const PAYMENT_WINDOW = 600   // 10 minutes in seconds

/**
 * Compute remaining seconds from order creation time.
 * Caps at PAYMENT_WINDOW and floors at 0.
 */
function calcSecsLeft(createdAt) {
  if (!createdAt) return PAYMENT_WINDOW
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  return Math.max(0, PAYMENT_WINDOW - elapsed)
}

/**
 * PaymentPage – shows QRIS code and polls for payment status.
 * Redirects to SuccessPage when order becomes PAID.
 */
export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const toast       = useToast()

  const [order,      setOrder]     = useState(null)
  const [payment,    setPayment]   = useState(null)
  const [pageStatus, setPageStatus] = useState('loading') // loading | ready | checking | paid | cancelled | expired | error
  const [secsLeft,   setSecsLeft]   = useState(PAYMENT_WINDOW)
  const pollRef   = useRef(null)
  const timerRef  = useRef(null)

  // Load order + payment on mount
  useEffect(() => {
    async function init() {
      try {
        // Load the order first
        const orderRes = await orderService.getOrder(orderId)
        setOrder(orderRes.data)
        setSecsLeft(calcSecsLeft(orderRes.data.created_at))

        // Create payment (idempotent — backend returns existing if already created)
        const payRes = await paymentService.createPayment(orderId)
        setPayment(payRes?.data || null)
        setPageStatus('ready')
      } catch (err) {
        toast.error('Gagal memuat data pembayaran')
        setPageStatus('error')
      }
    }
    init()
  }, [orderId])

  // Countdown timer — starts once order is loaded
  useEffect(() => {
    if (!order?.created_at) return
    if (pageStatus === 'paid' || pageStatus === 'cancelled' || pageStatus === 'expired') return

    timerRef.current = setInterval(() => {
      const secs = calcSecsLeft(order.created_at)
      setSecsLeft(secs)

      if (secs <= 0) {
        clearInterval(timerRef.current)
        clearInterval(pollRef.current)
        // Cancel the order if still pending
        if (order.status === 'pending') {
          orderService.cancelOrder(orderId).catch(() => {})
        }
        setPageStatus('expired')
      }
    }, 1000)

    return () => clearInterval(timerRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.created_at, pageStatus])

  // Start polling once order is in ready state
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

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-5 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl hover:bg-surface-100 transition-colors text-zinc-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">Pembayaran QRIS</h1>
            {order && (
              <p className="text-sm text-zinc-400">
                Pesanan {order.customer_name} · #{orderId}
              </p>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <PaymentStatus
          status={
            pageStatus === 'checking' ? 'checking' :
            order?.status === 'paid'  ? 'paid'      :
            order?.status === 'cancelled' ? 'cancelled' :
            'pending'
          }
        />

        {/* QR code */}
        <QRPayment
          qrisUrl={payment?.qris_url}
          total={order?.total_price || 0}
          orderId={orderId}
          reference={payment?.reference_id}
          secsLeft={secsLeft}
        />

        {/* Manual refresh */}
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
