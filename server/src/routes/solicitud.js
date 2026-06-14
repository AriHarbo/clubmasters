const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  buscarLigas, solicitarUnirse, cancelarSolicitud,
  verSolicitudes, responderSolicitud, unirseConCodigo,
  miSolicitud, iniciarLiga, actualizarReglas
} = require('../controllers/solicitudController')

router.get('/buscar', auth, buscarLigas)
router.post('/solicitar', auth, solicitarUnirse)
router.delete('/cancelar/:id', auth, cancelarSolicitud)
router.get('/mis-solicitudes', auth, miSolicitud)
router.get('/liga/:ligaId', auth, verSolicitudes)
router.put('/responder/:id', auth, responderSolicitud)
router.post('/codigo', auth, unirseConCodigo)
router.post('/iniciar', auth, iniciarLiga)
router.put('/reglas', auth, actualizarReglas)

module.exports = router