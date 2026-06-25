const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')
const prisma = new PrismaClient()

const jugadoresData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/jugadores.json'), 'utf-8')
)

const shuffle = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Rangos de media por tipo de sobre
const RANGOS_SOBRE = {
  bronce: { min: 60, max: 76, cantidad: 3 },
  plata: { min: 73, max: 83, cantidad: 3, bonusAlto: { min: 84, max: 88, chance: 0.25 } },
  oro: { min: 80, max: 88, cantidad: 3, bonusAlto: { min: 89, max: 93, chance: 0.35 } },
}

const generarJugadoresSobre = (tipo) => {
  const rango = RANGOS_SOBRE[tipo]
  const pool = jugadoresData.filter(j => j.media >= rango.min && j.media <= rango.max)
  const seleccionados = shuffle(pool).slice(0, rango.cantidad)

  // Chance de bonus alto (reemplaza el último si toca)
  if (rango.bonusAlto && Math.random() < rango.bonusAlto.chance) {
    const poolAlto = jugadoresData.filter(j => j.media >= rango.bonusAlto.min && j.media <= rango.bonusAlto.max)
    if (poolAlto.length > 0) {
      const jugadorAlto = shuffle(poolAlto)[0]
      seleccionados[seleccionados.length - 1] = jugadorAlto
    }
  }

  return seleccionados
}

// Ver mis sobres
const misSobres = async (req, res) => {
  try {
    const club = await prisma.club.findUnique({ where: { userId: req.userId } })
    if (!club) return res.status(404).json({ error: 'No tenés club' })

    const sobres = await prisma.sobreClub.findMany({
      where: { clubId: club.id, abierto: false },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ sobres, sobreInicialAbierto: club.sobreInicialAbierto })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener sobres' })
  }
}

// Abrir el sobre inicial (los 20 jugadores que ya tiene el club)
const abrirSobreInicial = async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { userId: req.userId },
      include: { jugadores: { include: { jugador: true } } }
    })
    if (!club) return res.status(404).json({ error: 'No tenés club' })
    if (club.sobreInicialAbierto) return res.status(400).json({ error: 'Ya abriste el sobre inicial' })

    await prisma.club.update({
      where: { id: club.id },
      data: { sobreInicialAbierto: true }
    })

    res.json({ jugadores: club.jugadores.map(jc => jc.jugador) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al abrir sobre inicial' })
  }
}

// Abrir un sobre normal (genera jugadores, NO los asigna todavía)
const abrirSobre = async (req, res) => {
  const { sobreId } = req.params
  try {
    const sobre = await prisma.sobreClub.findUnique({ where: { id: sobreId } })
    if (!sobre) return res.status(404).json({ error: 'Sobre no encontrado' })

    const club = await prisma.club.findUnique({ where: { userId: req.userId } })
    if (!club || sobre.clubId !== club.id) return res.status(403).json({ error: 'No autorizado' })
    if (sobre.abierto) return res.status(400).json({ error: 'Este sobre ya fue abierto' })

    const jugadoresGenerados = generarJugadoresSobre(sobre.tipo)

    await prisma.sobreClub.update({
      where: { id: sobreId },
      data: { abierto: true, jugadoresObtenidos: jugadoresGenerados }
    })

    res.json({ jugadores: jugadoresGenerados })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al abrir sobre' })
  }
}

// Confirmar qué jugadores quedarse (después de ver las cartas del sobre)
// body: { jugadorIds: ['j001','j045'], liberarJugadorClubIds: ['uuid-jc-1'] }
const confirmarJugadoresSobre = async (req, res) => {
  const { jugadorIds, liberarJugadorClubIds } = req.body
  try {
    const club = await prisma.club.findUnique({
      where: { userId: req.userId },
      include: { jugadores: true }
    })
    if (!club) return res.status(404).json({ error: 'No tenés club' })

    const plantillaActual = club.jugadores.length
    const aLiberar = liberarJugadorClubIds?.length || 0
    const aAgregar = jugadorIds?.length || 0
    const plantillaFinal = plantillaActual - aLiberar + aAgregar

    if (plantillaFinal > 26) {
      return res.status(400).json({ error: `Tu plantilla quedaría en ${plantillaFinal}/26. Liberá más jugadores.` })
    }

    // Liberar jugadores elegidos
    if (aLiberar > 0) {
      for (const jcId of liberarJugadorClubIds) {
        const jc = await prisma.jugadorClub.findUnique({ where: { id: jcId } })
        if (jc && jc.clubId === club.id) {
          await prisma.jugadorClub.delete({ where: { id: jcId } })
          await prisma.jugador.update({ where: { id: jc.jugadorId }, data: { estaLibre: true } })
        }
      }
    }

    // Agregar nuevos jugadores
    for (const jugadorId of jugadorIds) {
      let jugador = await prisma.jugador.findUnique({ where: { id: jugadorId } })
      if (!jugador) {
        const jData = jugadoresData.find(j => j.id === jugadorId)
        if (!jData) continue
        jugador = await prisma.jugador.create({
          data: {
            id: jData.id, nombre: jData.nombre, posicion: jData.posicion,
            media: jData.media, nacionalidad: jData.nacionalidad,
            club_real: jData.club_real, stats: jData.stats, precio: jData.precio,
          }
        })
      } else if (jugador.estaLibre) {
        await prisma.jugador.update({ where: { id: jugadorId }, data: { estaLibre: false } })
      }

      await prisma.jugadorClub.create({
        data: { jugadorId: jugador.id, clubId: club.id, esTitular: false, nivelEntrenamiento: 0 }
      })
    }

    res.json({ mensaje: 'Jugadores confirmados', plantillaFinal })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al confirmar jugadores' })
  }
}

// Otorgar un sobre (para usar después desde minijuegos)
const otorgarSobre = async (req, res) => {
  const { clubId, tipo } = req.body
  try {
    const sobre = await prisma.sobreClub.create({
      data: { clubId, tipo, abierto: false }
    })
    res.json(sobre)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al otorgar sobre' })
  }
}

module.exports = { misSobres, abrirSobreInicial, abrirSobre, confirmarJugadoresSobre, otorgarSobre }