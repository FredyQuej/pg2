
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import reportRoutes from './routes/reportRoutes.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/reports', reportRoutes)
app.get('/health', (_req,res)=>res.json({ ok:true, service:'report' }))

const PORT = process.env.PORT || 4003
app.listen(PORT, ()=>console.log(`report-service on ${PORT}`))
