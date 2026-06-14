const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { crearLiga, unirseALiga, obtenerLiga, misLigas } = require('../controllers/ligaController')

router.post('/crear', auth, crearLiga)
router.post('/unirse', auth, unirseALiga)
router.get('/mis-ligas', auth, misLigas)
router.get('/:id', auth, obtenerLiga)

module.exports = router