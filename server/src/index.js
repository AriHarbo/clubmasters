const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/liga', require('./routes/liga'))
app.use('/api/club', require('./routes/club'))
app.use('/api/solicitud', require('./routes/solicitud'))

app.get('/', (req, res) => {
  res.json({ message: 'Clubmasters API funcionando ✅' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})