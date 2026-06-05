import { Router } from 'express'
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto'
import rateLimit from 'express-rate-limit'
import { users, readToken } from '../store.js'

const router = Router()
const SECRET = process.env.JWT_SECRET || 'geek-dev-secret'

// 5 failed login attempts per 15 minutes per IP — successful logins don't count
const loginLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    5,
  standardHeaders:        true,
  legacyHeaders:          false,
  skipSuccessfulRequests: true,
  message:                { error: 'Too many login attempts, please try again in 15 minutes.' },
})

function makeToken(userId) {
  const payload = Buffer.from(JSON.stringify({ id: userId, exp: Date.now() + 7 * 86400000 }))
    .toString('base64url')
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function hashPw(pw) {
  const salt = randomBytes(16).toString('hex')
  return salt + ':' + scryptSync(pw, salt, 64).toString('hex')
}

function checkPw(pw, stored) {
  const [salt, hash] = stored.split(':')
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(pw, salt, 64))
}

const pub = u => ({ id: u.id, email: u.email, name: u.name })

router.post('/signup', (req, res) => {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const key = email.toLowerCase().trim()
  if (users.has(key)) return res.status(409).json({ error: 'An account with that email already exists' })

  const user = {
    id:           randomBytes(8).toString('hex'),
    email:        key,
    name:         (name || '').trim() || key.split('@')[0],
    passwordHash: hashPw(password),
    meds:         [],
  }
  users.set(key, user)
  res.json({ user: pub(user), token: makeToken(user.id) })
})

router.post('/login', loginLimiter, (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const user = users.get(email.toLowerCase().trim())
  if (!user || !checkPw(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  res.json({ user: pub(user), token: makeToken(user.id) })
})

router.get('/me', (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const data = readToken(auth.slice(7))
  if (!data) return res.status(401).json({ error: 'Token expired or invalid' })
  const user = [...users.values()].find(u => u.id === data.id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: pub(user) })
})

export default router
