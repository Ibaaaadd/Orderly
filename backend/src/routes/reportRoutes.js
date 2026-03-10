const express = require('express')
const { getSummary, getMonthlyReport, getTopMenus } = require('../controllers/reportController')

const router = express.Router()

router.get('/summary',   getSummary)
router.get('/monthly',   getMonthlyReport)
router.get('/top-menus', getTopMenus)

module.exports = router
