import { createHmac } from 'crypto'

// Shared in-memory state — swap for a real DB in production
export const users = new Map()

const SECRET = process.env.JWT_SECRET || 'geek-dev-secret'

export function readToken(token) {
  try {
    const [payload, sig] = token.split('.')
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (sig !== expected) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return data.exp > Date.now() ? data : null
  } catch { return null }
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sign in to continue' })
  }
  const data = readToken(auth.slice(7))
  if (!data) return res.status(401).json({ error: 'Session expired — please sign in again' })
  const user = [...users.values()].find(u => u.id === data.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  req.user = user
  next()
}
