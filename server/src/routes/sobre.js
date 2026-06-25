const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  misSobres, abrirSobreInicial, abrirSobre,
  confirmarJugadoresSobre, otorgarSobre
} = require('../controllers/sobreController')

router.get('/mis-sobres', auth, misSobres)
router.post('/inicial', auth, abrirSobreInicial)
router.post('/abrir/:sobreId', auth, abrirSobre)
router.post('/confirmar', auth, confirmarJugadoresSobre)
router.post('/otorgar', auth, otorgarSobre)

module.exports = router