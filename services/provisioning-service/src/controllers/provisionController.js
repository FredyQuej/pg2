
import { gh } from '../utils/githubAPI.js'

export const provisionWebhook = async (req, res) => {
  try {
    const { owner, repo, events = ['pull_request','push','release'], url, secret, active = true } = req.body
    const token = process.env.GITHUB_TOKEN
    if (!owner || !repo) return res.status(400).json({ message:'owner y repo requeridos' })
    if (!token) return res.status(400).json({ message:'GITHUB_TOKEN no configurado' })
    const webhookUrl = url || process.env.EVENTS_PUBLIC_URL

    const payload = {
      name:'web', active, events,
      config: { url: webhookUrl, content_type: 'json', secret: secret || process.env.GITHUB_WEBHOOK_SECRET, insecure_ssl:'0' }
    }

    const hooks = await gh(`/repos/${owner}/${repo}/hooks`, 'GET', null, token)
    const existing = Array.isArray(hooks) ? hooks.find(h => h.config?.url === webhookUrl) : null
    const path = existing ? `/repos/${owner}/${repo}/hooks/${existing.id}` : `/repos/${owner}/${repo}/hooks`
    const method = existing ? 'PATCH' : 'POST'
    const result = await gh(path, method, payload, token)
    res.json({ action: existing ? 'updated' : 'created', hook: result })
  } catch (e) {
    res.status(500).json({ message:'Error creando hook', error: e.response || e.message })
  }
}
