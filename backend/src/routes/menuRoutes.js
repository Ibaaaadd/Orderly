const express = require('express')
const { getMenus, getMenuById, createMenu, updateMenu, deleteMenu } = require('../controllers/menuController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/',     getMenus)
router.get('/:id',  getMenuById)
router.post('/',    requireAuth, createMenu)
router.put('/:id',  requireAuth, updateMenu)
router.delete('/:id', requireAuth, deleteMenu)

module.exports = router
