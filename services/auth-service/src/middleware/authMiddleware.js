
import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET || 'sistemasumgsecret'

export const requireAuth = (req, res, next) => {
  const h = req.headers.authorization || ''
  if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' })
  try {
    const token = h.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido' })
  }
}
