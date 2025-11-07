
import { Router } from 'express'
import { generate } from '../controllers/reportController.js'
const r = Router()
r.post('/generate', generate)
export default r
