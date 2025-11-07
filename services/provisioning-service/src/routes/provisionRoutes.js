
import { Router } from 'express'
import { provisionWebhook } from '../controllers/provisionController.js'
const r = Router()
r.post('/webhook', provisionWebhook)
export default r
