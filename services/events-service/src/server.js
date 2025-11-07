import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Rutas existentes
import webhookRoutes from './routes/webhookRoutes.js'
import branchRoutes from './routes/branchRoutes.js'
import repoRoutes from './routes/repoRoutes.js'

// 🔥 Nueva ruta para eventos SSE
import streamRoutes from './routes/streamRoutes.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ type: ['application/json', 'application/*+json'] }))

// Rutas principales
app.use('/webhooks', webhookRoutes)
app.use('/changes', branchRoutes)
app.use('/repos', repoRoutes)

// 🆕 Ruta de streaming de eventos SSE (para el frontend)
app.use('/', streamRoutes)

// Ruta de salud
app.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'events' })
)

// Inicio del servidor
const PORT = process.env.PORT || 4002
app.listen(PORT, () => console.log(`✅ events-service on port ${PORT}`))
