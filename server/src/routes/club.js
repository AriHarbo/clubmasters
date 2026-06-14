const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { crearClub, obtenerMiClub, obtenerClub, actualizarFormacion } = require('../controllers/clubController')

router.post('/crear', auth, crearClub)
router.get('/mi-club', auth, obtenerMiClub)
router.get('/:id', auth, obtenerClub)
router.put('/formacion', auth, actualizarFormacion)

module.exports = router