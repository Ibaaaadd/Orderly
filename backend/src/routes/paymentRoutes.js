const express = require('express')
const { createPayment, handleWebhook } = require('../controllers/paymentController')
const { webhookValidator } = require('../middleware/webhookValidator')

const router = express.Router()

router.post('/create',  createPayment)

// Webhook endpoint – validator middleware checks signature before processing
router.post('/webhook', webhookValidator, handleWebhook)

module.exports = router
