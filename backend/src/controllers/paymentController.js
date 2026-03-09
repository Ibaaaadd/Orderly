const orderModel   = require('../models/orderModel')
const paymentModel = require('../models/paymentModel')
const paymentService = require('../services/paymentService')

/**
 * POST /api/payments/create
 * Body: { order_id }
 *
 * Creates a QRIS payment for the given order.
 * If a payment record already exists, returns the existing one.
 */
async function createPayment(req, res, next) {
  try {
    const { order_id } = req.body

    if (!order_id) {
      return res.status(400).json({ success: false, message: 'order_id wajib diisi' })
    }

    // Load the order
    const order = await orderModel.findById(parseInt(order_id, 10))
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' })
    }

    // Can't pay for a cancelled or already-paid order
    if (order.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Pesanan sudah dibayar' })
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Pesanan sudah dibatalkan' })
    }

    // Check if payment already exists for this order
    const existing = await paymentModel.findByOrderId(order_id)
    if (existing) {
      return res.json({ success: true, data: existing })
    }

    // Create payment via gateway
    const { reference_id, qris_url } = await paymentService.createQRISPayment(order)

    // Persist payment record
    const payment = await paymentModel.create({
      order_id:     order.id,
      gateway:      process.env.PAYMENT_GATEWAY || 'mock',
      reference_id,
      qris_url,
    })

    // Store reference on order
    await orderModel.setPaymentReference(order.id, reference_id)

    res.status(201).json({ success: true, data: payment })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/payments/webhook
 *
 * Receives payment status callbacks from the gateway.
 * Updates order and payment status accordingly.
 *
 * Webhook verification is handled by webhookValidator middleware.
 */
async function handleWebhook(req, res, next) {
  try {
    const payload = req.body

    // Let the payment service parse the gateway-specific payload
    const { reference_id, status } = paymentService.handleWebhook(payload)

    if (!reference_id) {
      return res.status(400).json({ success: false, message: 'Invalid webhook payload' })
    }

    if (status === 'paid') {
      // Find payment record by reference
      const payment = await paymentModel.findByReference(reference_id)
      if (!payment) {
        // Acknowledge but don't crash — could be a replay
        return res.json({ success: true, message: 'Reference not found; skipped' })
      }

      // Update payment status
      await paymentModel.updateStatus(payment.id, 'paid')

      // Update order status
      await orderModel.updateStatus(payment.order_id, 'paid')

      console.log(`[Webhook] Order #${payment.order_id} marked as PAID (ref: ${reference_id})`)
    }

    // Always return 200 to the gateway to acknowledge receipt
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

module.exports = { createPayment, handleWebhook }
