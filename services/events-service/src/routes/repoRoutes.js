
import { Router } from 'express'
import { prisma } from '../prismaClient.js'
const r = Router()

r.post('/', async (req, res) => {
  const { name, owner } = req.body
  const repo = await prisma.repository.create({ data: { name, owner } })
  res.json(repo)
})

r.get('/', async (_req, res) => {
  res.json(await prisma.repository.findMany({ orderBy: { createdAt: 'desc' } }))
})

export default r
