
import { Router } from 'express'
import { pendingToMain, searchEvents } from '../controllers/branchController.js'
const r = Router()
r.get('/pending', pendingToMain)
r.get('/search', searchEvents)
export default r
