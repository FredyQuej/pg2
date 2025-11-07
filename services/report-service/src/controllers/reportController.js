
import { prisma } from '../prismaClient.js'
import { generateReportPDF } from '../utils/pdfGenerator.js'

export const generate = async (req, res) => {
  const { repoId, title } = req.body
  if (!repoId) return res.status(400).json({ message: 'repoId requerido' })
  const repo = await prisma.repository.findUnique({ where: { id: Number(repoId) } })
  if (!repo) return res.status(404).json({ message: 'Repo no encontrado' })

  await prisma.report.create({ data: { repoId: repo.id, data: { generatedAt: new Date().toISOString() } } })
  const lines = [`Reporte para ${repo.owner}/${repo.name}`]
  generateReportPDF(res, title || `Reporte de cambios - ${repo.owner}/${repo.name}`, `${repo.owner}/${repo.name}`, lines)
}
