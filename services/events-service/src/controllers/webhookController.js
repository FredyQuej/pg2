import { eventBus } from '../eventBus.js'

export async function githubWebhook(req, res) {
  try {
    const event = req.headers['x-github-event']
    const payload = req.body
    const repo = payload.repository?.full_name || '(desconocido)'

    eventBus.emit('github-event', {
      event,
      repo,
      at: new Date().toISOString(),
    })

    res.sendStatus(200)
  } catch (e) {
    console.error('Error webhook:', e)
    res.status(500).json({ error: e.message })
  }
}
