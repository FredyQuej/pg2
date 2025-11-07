
import PDFDocument from 'pdfkit'

export function generateReportPDF(res, title, repoName, events) {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="reporte-${repoName}.pdf"`)
  const doc = new PDFDocument({ margin: 40 })
  doc.pipe(res)

  doc.fontSize(18).text(title, { underline: true })
  doc.moveDown()
  doc.fontSize(12).text(`Repositorio: ${repoName}`)
  doc.text(`Generado: ${new Date().toLocaleString()}`)
  doc.moveDown()

  ;(events || []).forEach((line, i) => {
    doc.fontSize(12).text(`${i+1}. ${line}`)
  })

  doc.end()
}
