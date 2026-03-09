const express = require('express')
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController')

const router = express.Router()

router.get('/',     getCategories)
router.post('/',    createCategory)
router.put('/:id',  updateCategory)
router.delete('/:id', deleteCategory)

module.exports = router
