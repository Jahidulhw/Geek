import { createHmac } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR   = path.join(__dirname, 'data')
const STORE_PATH = path.join(DATA_DIR, 'users.json')

mkdirSync(DATA_DIR, { recursive: true })

function load() {
  try {
    if (existsSync(STORE_PATH)) {
      const arr = JSON.parse(readFileSync(STORE_PATH, 'utf8'))
      return new Map(arr.map(u => [u.email, u]))
    }
  } catch (err) {
    console.error('Store load error:', err.message)
  }
  return new Map()
}

function persist(map) {
  try {
    writeFileSync(STORE_PATH, JSON.stringify([...map.values()], null, 2))
  } catch (err) {
    console.error('Store write error:', err.message)
  }
}

// Proxy the Map so every .set() automatically writes to disk
const _users = load()
export const users = new Proxy(_users, {
  get(target, prop) {
    if (prop === 'set') {
      return (key, value) => {
        target.set(key, value)
        persist(target)
        return target
      }
    }
    const val = target[prop]
    return typeof val === 'function' ? val.bind(target) : val
  },
})

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
  if (!user) return res.status(401).json({ error: 'Session expired — please sign in again' })
  req.user = user
  next()
}
