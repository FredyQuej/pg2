
import { Router } from 'express'
import { githubWebhook } from '../controllers/webhookController.js'
const r = Router()
r.post('/github', githubWebhook)
export default r
