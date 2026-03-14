const express = require('express')
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/',     getCategories)
router.post('/',    requireAuth, createCategory)
router.put('/:id',  requireAuth, updateCategory)
router.delete('/:id', requireAuth, deleteCategory)

module.exports = router
