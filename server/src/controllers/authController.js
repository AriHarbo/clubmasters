const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const register = async (req, res) => {
  const { email, username, password } = req.body

  try {
    const existeEmail = await prisma.user.findUnique({ where: { email } })
    if (existeEmail) return res.status(400).json({ error: 'El email ya está registrado' })

    const existeUsername = await prisma.user.findUnique({ where: { username } })
    if (existeUsername) return res.status(400).json({ error: 'El nombre de usuario ya existe' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword }
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user: { id: user.id, email: user.email, username: user.username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Usuario no encontrado' })

    const passwordValida = await bcrypt.compare(password, user.password)
    if (!passwordValida) return res.status(400).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.json({ token, user: { id: user.id, email: user.email, username: user.username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
}

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { club: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' })
  }
}

module.exports = { register, login, me }