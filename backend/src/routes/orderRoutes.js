const express = require('express')
const { createOrder, getOrder, getAllOrders } = require('../controllers/orderController')

const router = express.Router()

router.post('/',    createOrder)
router.get('/',     getAllOrders)
router.get('/:id',  getOrder)

module.exports = router
