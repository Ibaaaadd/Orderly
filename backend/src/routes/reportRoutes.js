const express = require('express')
const { getSummary, getMonthlyReport, getTopMenus, getDailyReport } = require('../controllers/reportController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/summary',   requireAuth, getSummary)
router.get('/monthly',   requireAuth, getMonthlyReport)
router.get('/top-menus', requireAuth, getTopMenus)
router.get('/daily',     requireAuth, getDailyReport)

module.exports = router
