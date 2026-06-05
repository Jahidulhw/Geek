import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { fileURLToPath } from 'url'
import drugsRouter from './routes/drugs.js'
import interactionsRouter from './routes/interactions.js'
import explainRouter from './routes/explain.js'
import authRouter from './routes/auth.js'
import medsRouter from './routes/meds.js'
import newsRouter from './routes/news.js'
import chatRouter from './routes/chat.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 5000

// Trust the first proxy hop (Render's load balancer) so req.ip is the real client IP
app.set('trust proxy', 1)

// Security headers — CSP and COEP disabled; they need per-app tuning
app.use(helmet({
  contentSecurityPolicy:     false,
  crossOriginEmbedderPolicy: false,
}))

app.use(cors())
app.use(express.json())

// Strip keys that start with $ or contain . to block NoSQL injection patterns
app.use(mongoSanitize())

// Global rate limit: 100 requests per 15 minutes per IP
app.use('/api/', rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message:         { error: 'Too many requests, please try again later.' },
}))

app.use('/api/drugs', drugsRouter)
app.use('/api/interactions', interactionsRouter)
app.use('/api/explain', explainRouter)
app.use('/api/auth', authRouter)
app.use('/api/meds', medsRouter)
app.use('/api/news', newsRouter)
app.use('/api/chat', chatRouter)

app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
