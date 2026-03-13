const express = require('express')
const { createOrder, getOrder, getAllOrders, cancelOrder, markReady, markCompleted } = require('../controllers/orderController')

const router = express.Router()

router.post('/',               createOrder)
router.get('/',                getAllOrders)
router.get('/:id',             getOrder)
router.patch('/:id/cancel',    cancelOrder)
router.patch('/:id/ready',     markReady)
router.patch('/:id/complete',  markCompleted)

module.exports = router
