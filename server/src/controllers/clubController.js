const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')
const prisma = new PrismaClient()

// Cargar jugadores del JSON
const jugadoresData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../data/jugadores.json'), 'utf-8')
)

// Mezclar array aleatoriamente (Fisher-Yates)
const shuffle = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const seleccionarJugadoresIniciales = () => {
  // Separar por media
  const bajos = jugadoresData.filter(j => j.media < 80)
  const medios = jugadoresData.filter(j => j.media >= 80 && j.media < 87)
  const altos = jugadoresData.filter(j => j.media >= 87)

  const seleccionados = []

  // 16 jugadores bajos
  const bajosShuffled = shuffle(bajos)
  seleccionados.push(...bajosShuffled.slice(0, 16))

  // 2 jugadores medios
  const mediosShuffled = shuffle(medios)
  seleccionados.push(...mediosShuffled.slice(0, 2))

  // 2 jugadores altos (la sorpresa)
  const altosShuffled = shuffle(altos)
  seleccionados.push(...altosShuffled.slice(0, 2))

  return seleccionados
}

const crearClub = async (req, res) => {
  const { nombre, escudo, ligaId } = req.body

  try {
    const liga = await prisma.liga.findUnique({ where: { id: ligaId } })
    if (!liga) return res.status(404).json({ error: 'Liga no encontrada' })

    const clubExistente = await prisma.club.findFirst({
      where: { userId: req.userId, ligaId }
    })
    if (clubExistente) return res.status(400).json({ error: 'Ya tenés un club en esta liga' })

    const clubGlobal = await prisma.club.findUnique({ where: { userId: req.userId } })
    if (clubGlobal) return res.status(400).json({ error: 'Ya tenés un club creado' })

    const club = await prisma.club.create({
      data: {
        nombre,
        escudo: escudo || { forma: 'escudo1', colorPrimario: '#ff0000', colorSecundario: '#ffffff', detalle: 'ninguno' },
        userId: req.userId,
        ligaId,
        esAdmin: liga.creadorId === req.userId, // ← admin si es el creador
      }
    })
    console.log('Jugadores cargados:', jugadoresData.length)
    const jugadoresIniciales = seleccionarJugadoresIniciales()

    for (const jData of jugadoresIniciales) {
      let jugador = await prisma.jugador.findUnique({ where: { id: jData.id } })

      if (!jugador) {
        jugador = await prisma.jugador.create({
          data: {
            id: jData.id,
            nombre: jData.nombre,
            posicion: jData.posicion,
            media: jData.media,
            nacionalidad: jData.nacionalidad,
            club_real: jData.club_real,
            stats: jData.stats,
            precio: jData.precio
          }
        })
      }

      await prisma.jugadorClub.create({
        data: {
          jugadorId: jugador.id,
          clubId: club.id,
          esTitular: false,
          nivelEntrenamiento: 0
        }
      })

      console.log('Jugador asignado:', jugador.nombre)
    }

    const clubCompleto = await prisma.club.findUnique({
      where: { id: club.id },
      include: {
        jugadores: {
          include: { jugador: true }
        }
      }
    })

    await prisma.solicitudLiga.updateMany({
      where: { userId: req.userId, ligaId, estado: 'aceptada' },
      data: { estado: 'completada' }
    })
    
    res.json(clubCompleto)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al crear el club' })
  }
}

const obtenerMiClub = async (req, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { userId: req.userId },
      include: {
        jugadores: {
          include: { jugador: true }
        },
        liga: true
      }
    })

    if (!club) return res.status(404).json({ error: 'No tenés un club creado' })

    res.json(club)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener el club' })
  }
}

const obtenerClub = async (req, res) => {
  const { id } = req.params

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        jugadores: { include: { jugador: true } },
        user: { select: { username: true } }
      }
    })

    if (!club) return res.status(404).json({ error: 'Club no encontrado' })

    res.json(club)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener el club' })
  }
}

const actualizarFormacion = async (req, res) => {
  const { jugadores, formacion } = req.body

  try {
    const club = await prisma.club.findUnique({ where: { userId: req.userId } })
    if (!club) return res.status(404).json({ error: 'No tenés un club' })

    const titulares = jugadores.filter(j => j.esTitular)
    if (titulares.length > 11) return res.status(400).json({ error: 'No podés tener más de 11 titulares' })

    // Guardar formación
    if (formacion) {
      await prisma.club.update({
        where: { userId: req.userId },
        data: { formacion }
      })
    }

    for (const j of jugadores) {
      await prisma.jugadorClub.update({
        where: { id: j.jugadorClubId },
        data: {
          esTitular: j.esTitular,
          posicionFormacion: j.posicionFormacion || null
        }
      })
    }

    res.json({ mensaje: 'Formación actualizada' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar formación' })
  }
}

module.exports = { crearClub, obtenerMiClub, obtenerClub, actualizarFormacion }