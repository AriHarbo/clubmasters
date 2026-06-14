const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Buscar ligas públicas
const buscarLigas = async (req, res) => {
  const { q } = req.query
  try {
    const ligas = await prisma.liga.findMany({
      where: {
        esPublica: true,
        iniciada: false,
        ...(q ? { nombre: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: { _count: { select: { clubes: true } } },
      take: 20,
    })
    res.json(ligas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al buscar ligas' })
  }
}

// Solicitar unirse (solo ligas privadas)
const solicitarUnirse = async (req, res) => {
  const { ligaId } = req.body
  try {
    const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })
    if (liga.iniciada) return res.status(400).json({ error: 'La liga ya está iniciada' })

    const solicitudExistente = await prisma.solicitudLiga.findFirst({
      where: { userId: req.userId, ligaId, estado: 'pendiente' }
    })
    if (solicitudExistente) return res.status(400).json({ error: 'Ya tenés una solicitud pendiente' })

    const clubExistente = await prisma.club.findFirst({
      where: { userId: req.userId, ligaId }
    })
    if (clubExistente) return res.status(400).json({ error: 'Ya estás en esta liga' })

    const solicitud = await prisma.solicitudLiga.create({
      data: { userId: req.userId, ligaId }
    })
    res.json(solicitud)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al solicitar unirse' })
  }
}

// Cancelar solicitud
const cancelarSolicitud = async (req, res) => {
  const { id } = req.params
  try {
    const solicitud = await prisma.solicitudLiga.findUnique({ where: { id } })
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' })
    if (solicitud.userId !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    await prisma.solicitudLiga.delete({ where: { id } })
    res.json({ mensaje: 'Solicitud cancelada' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cancelar solicitud' })
  }
}

// Ver solicitudes pendientes de mi liga (admin)
const verSolicitudes = async (req, res) => {
  const { ligaId } = req.params
  try {
    const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })
    if (liga.creadorId !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    const solicitudes = await prisma.solicitudLiga.findMany({
      where: { ligaId, estado: 'pendiente' },
      include: { liga: true }
    })

    const solicitudesConUser = await Promise.all(
      solicitudes.map(async (s) => {
        const user = await prisma.user.findUnique({
          where: { id: s.userId },
          select: { id: true, username: true, email: true }
        })
        return { ...s, user }
      })
    )

    res.json(solicitudesConUser)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener solicitudes' })
  }
}

// Aceptar o rechazar solicitud (admin)
const responderSolicitud = async (req, res) => {
  const { id } = req.params
  const { accion } = req.body

  try {
    const solicitud = await prisma.solicitudLiga.findUnique({
      where: { id },
      include: { liga: true }
    })
    if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' })
    if (solicitud.liga.creadorId !== req.userId) return res.status(403).json({ error: 'No autorizado' })

    await prisma.solicitudLiga.update({
      where: { id },
      data: { estado: accion === 'aceptar' ? 'aceptada' : 'rechazada' }
    })

    res.json({ mensaje: accion === 'aceptar' ? 'Solicitud aceptada' : 'Solicitud rechazada', ligaId: solicitud.ligaId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al responder solicitud' })
  }
}

// Unirse con código (liga privada) — solo valida, no crea club
const unirseConCodigo = async (req, res) => {
  const { codigo } = req.body
  try {
    const liga = await prisma.liga.findUnique({ where: { codigo } })
    if (!liga) return res.status(404).json({ error: 'Código inválido' })
    if (liga.iniciada) return res.status(400).json({ error: 'La liga ya está iniciada' })

    const clubExistente = await prisma.club.findFirst({
      where: { userId: req.userId, ligaId: liga.id }
    })
    if (clubExistente) return res.status(400).json({ error: 'Ya estás en esta liga' })

    res.json({ liga })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al validar código' })
  }
}

// Mi solicitud pendiente (para persistir el estado entre sesiones)
const miSolicitud = async (req, res) => {
  try {
    // Buscar pendiente O aceptada (aceptada = necesita crear club todavía)
    const solicitud = await prisma.solicitudLiga.findFirst({
      where: { 
        userId: req.userId, 
        estado: { in: ['pendiente', 'aceptada'] }
      },
      include: { liga: true }
    })
    res.json(solicitud || null)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener solicitud' })
  }
}

// Iniciar liga (admin)
const iniciarLiga = async (req, res) => {
  const { ligaId } = req.body
  try {
    const liga = await prisma.liga.findUnique({
      where: { id: ligaId },
      include: { clubes: true }
    })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })
    if (liga.creadorId !== req.userId) return res.status(403).json({ error: 'No autorizado' })
    if (liga.clubes.length < 2) return res.status(400).json({ error: 'Necesitás al menos 2 clubes para iniciar' })
    if (liga.iniciada) return res.status(400).json({ error: 'La liga ya está iniciada' })

    await prisma.liga.update({
      where: { id: ligaId },
      data: { iniciada: true, estado: 'activa' }
    })

    res.json({ mensaje: 'Liga iniciada' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar la liga' })
  }
}

// Actualizar reglas de la liga (admin)
const actualizarReglas = async (req, res) => {
  const { ligaId, frecuenciaDias, minimoJugadores } = req.body
  try {
    const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })
    if (liga.creadorId !== req.userId) return res.status(403).json({ error: 'No autorizado' })
    if (liga.iniciada) return res.status(400).json({ error: 'No podés cambiar reglas de una liga iniciada' })

    const ligaActualizada = await prisma.liga.update({
      where: { id: ligaId },
      data: {
        ...(frecuenciaDias ? { frecuenciaDias } : {}),
        ...(minimoJugadores ? { minimoJugadores } : {}),
      }
    })

    res.json(ligaActualizada)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar reglas' })
  }
}

module.exports = {
  buscarLigas, solicitarUnirse, cancelarSolicitud,
  verSolicitudes, responderSolicitud, unirseConCodigo,
  miSolicitud, iniciarLiga, actualizarReglas
}