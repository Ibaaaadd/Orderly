const express = require('express')
const { createOrder, getOrder, getAllOrders, cancelOrder } = require('../controllers/orderController')

const router = express.Router()

router.post('/',           createOrder)
router.get('/',            getAllOrders)
router.get('/:id',         getOrder)
router.patch('/:id/cancel', cancelOrder)

module.exports = router
