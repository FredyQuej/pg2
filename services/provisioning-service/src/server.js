
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './routes/provisionRoutes.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())

app.use('/provision', routes)
app.get('/health', (_req,res)=>res.json({ ok:true, service:'provisioning' }))

const PORT = process.env.PORT || 4010
app.listen(PORT, ()=>console.log(`provisioning-service on ${PORT}`))
