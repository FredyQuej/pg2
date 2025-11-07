
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import { ensureSeed } from '../seed.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.get('/health', (_req, res) => res.json({ ok: true, service: 'auth' }))

const PORT = process.env.PORT || 4001
app.listen(PORT, async () => {
  await ensureSeed()
  console.log(`auth-service on ${PORT}`)
})
