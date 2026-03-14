const express = require('express')
const { createOrder, getOrder, getAllOrders, cancelOrder, markReady, markCompleted } = require('../controllers/orderController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

function requireAuthForAdminList(req, res, next) {
  if (req.query.browser_id) {
    return next()
  }
  return requireAuth(req, res, next)
}

router.post('/',               createOrder)
router.get('/',                requireAuthForAdminList, getAllOrders)
router.get('/:id',             getOrder)
router.patch('/:id/cancel',    cancelOrder)
router.patch('/:id/ready',     requireAuth, markReady)
router.patch('/:id/complete',  requireAuth, markCompleted)

module.exports = router
