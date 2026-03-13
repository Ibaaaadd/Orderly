const express = require('express')
const { createPayment, handleWebhook, createCashPayment, confirmCashPayment } = require('../controllers/paymentController')
const { webhookValidator } = require('../middleware/webhookValidator')

const router = express.Router()

router.post('/create',                    createPayment)
router.post('/cash',                      createCashPayment)
router.patch('/cash/:orderId/confirm',    confirmCashPayment)

// Webhook endpoint – validator middleware checks signature before processing
router.post('/webhook', webhookValidator, handleWebhook)

module.exports = router
