
import { prisma } from '../prismaClient.js'

export const pendingToMain = async (req, res) => {
  const { repoId } = req.query
  if (!repoId) return res.status(400).json({ message: 'repoId requerido' })
  const prs = await prisma.pullRequest.findMany({
    where: { repoId: Number(repoId), state: 'open' },
    orderBy: { createdAt: 'desc' }
  })
  const pending = prs.filter(pr => pr.base === 'main' || pr.base === 'master').map(pr => ({
    number: pr.number, title: pr.title, branch: pr.branch, base: pr.base
  }))
  res.json({ pending, count: pending.length })
}

export const searchEvents = async (req, res) => {
  const { repoId, from, to, q, type = 'all', state = 'all', page = '1', pageSize = '10' } = req.query
  if (!repoId) return res.status(400).json({ message: 'repoId requerido' })
  const where = { repoId: Number(repoId) }
  const p = Math.max(1, parseInt(page, 10) || 1)
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10))

  let items = []
  if (type === 'pr') {
    items = await prisma.pullRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (p-1)*ps, take: ps })
    if (state !== 'all') items = items.filter(it => it.state === state)
  } else if (type === 'release') {
    const events = await prisma.event.findMany({ where: { repoId: Number(repoId), type: 'release' }, orderBy: { createdAt: 'desc' }, skip: (p-1)*ps, take: ps })
    items = events.map(ev => ({ id: ev.id, type: 'release', tag: ev.data?.release?.tag_name, name: ev.data?.release?.name, target: ev.data?.release?.target_commitish, createdAt: ev.createdAt }))
  } else if (type === 'push') {
    const events = await prisma.event.findMany({ where: { repoId: Number(repoId), type: 'push' }, orderBy: { createdAt: 'desc' }, skip: (p-1)*ps, take: ps })
    items = events.map(ev => ({ id: ev.id, type: 'push', branch: (ev.data?.ref || '').replace('refs/heads/',''), commits: (Array.isArray(ev.data?.commits) ? ev.data.commits.length : 0), createdAt: ev.createdAt }))
  } else {
    const events = await prisma.event.findMany({ where: { repoId: Number(repoId) }, orderBy: { createdAt: 'desc' }, skip: (p-1)*ps, take: ps })
    items = events.map(ev => ev.type === 'pull_request'
      ? { id: ev.id, type: 'pull_request', number: ev.data?.number, title: ev.data?.pull_request?.title, author: ev.data?.pull_request?.user?.login, branch: ev.data?.pull_request?.head?.ref, base: ev.data?.pull_request?.base?.ref, state: ev.data?.pull_request?.state, createdAt: ev.createdAt }
      : ev.type === 'release'
        ? { id: ev.id, type: 'release', tag: ev.data?.release?.tag_name, name: ev.data?.release?.name, target: ev.data?.release?.target_commitish, createdAt: ev.createdAt }
        : { id: ev.id, type: 'push', branch: (ev.data?.ref || '').replace('refs/heads/',''), commits: (Array.isArray(ev.data?.commits) ? ev.data.commits.length : 0), createdAt: ev.createdAt }
    )
  }

  if (q) {
    const s = String(q).toLowerCase()
    items = items.filter(it => JSON.stringify(it).toLowerCase().includes(s))
  }
  res.json({ items, page: p, pageSize: ps, total: items.length, totalPages: 1 })
}
