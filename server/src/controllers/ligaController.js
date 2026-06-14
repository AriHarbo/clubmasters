const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Generar código único para la liga
const generarCodigo = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const crearLiga = async (req, res) => {
  const { nombre, frecuenciaDias, esPublica, minimoJugadores } = req.body
  try {
    const codigo = generarCodigo()
    const liga = await prisma.liga.create({
      data: {
        nombre,
        codigo,
        frecuenciaDias: frecuenciaDias || 3,
        esPublica: esPublica || false,
        minimoJugadores: minimoJugadores || 2,
        creadorId: req.userId
      }
    })
    res.json(liga)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear la liga' })
  }
}

const unirseALiga = async (req, res) => {
  const { codigo } = req.body

  try {
    // Verificar que la liga existe
    const liga = await prisma.liga.findUnique({ where: { codigo } })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })

    // Verificar que el usuario no tenga ya un club en esta liga
    const clubExistente = await prisma.club.findFirst({
      where: { userId: req.userId, ligaId: liga.id }
    })
    if (clubExistente) return res.status(400).json({ error: 'Ya tenés un club en esta liga' })

    res.json({ liga, mensaje: 'Liga encontrada, podés crear tu club' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al unirse a la liga' })
  }
}

const obtenerLiga = async (req, res) => {
  const { id } = req.params

  try {
    const liga = await prisma.liga.findUnique({
      where: { id },
      include: {
        clubes: {
          include: {
            user: { select: { username: true } },
            jugadores: { include: { jugador: true } }
          }
        }
      }
    })

    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })

    res.json(liga)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener la liga' })
  }
}

const misLigas = async (req, res) => {
  try {
    const clubes = await prisma.club.findMany({
      where: { userId: req.userId },
      include: { liga: true }
    })

    const ligas = clubes.map(c => ({ ...c.liga, miClub: c }))
    res.json(ligas)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener ligas' })
  }
}

module.exports = { crearLiga, unirseALiga, obtenerLiga, misLigas }