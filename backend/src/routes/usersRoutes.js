const express = require('express')
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/usersController')
const { requireAuth, requireRoles } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth, requireRoles(['admin']))

router.get('/', getUsers)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router
