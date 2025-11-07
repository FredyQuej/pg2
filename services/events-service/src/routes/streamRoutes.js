import { Router } from 'express'
import { eventBus } from '../eventBus.js'

const r = Router()

r.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const ping = setInterval(() => {
    res.write(`event: ping\ndata: {}\n\n`)
  }, 25000)

  const sendEvent = (data) => {
    res.write(`event: github\ndata: ${JSON.stringify(data)}\n\n`)
  }

  eventBus.on('github-event', sendEvent)

  req.on('close', () => {
    clearInterval(ping)
    eventBus.off('github-event', sendEvent)
  })
})

export default r
