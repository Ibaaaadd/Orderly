const express = require('express')
const { getSummary, getMonthlyReport, getTopMenus, getDailyReport } = require('../controllers/reportController')

const router = express.Router()

router.get('/summary',   getSummary)
router.get('/monthly',   getMonthlyReport)
router.get('/top-menus', getTopMenus)
router.get('/daily',     getDailyReport)

module.exports = router
