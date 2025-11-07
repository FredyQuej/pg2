
import fetch from 'node-fetch'

const API = 'https://api.github.com'

export async function gh(path, method='GET', body, token) {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Accept':'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const text = await r.text()
  let json; try { json = JSON.parse(text) } catch { json = { raw: text } }
  if (!r.ok) {
    const e = new Error(`GitHub API ${r.status}`)
    e.response = json
    throw e
  }
  return json
}
