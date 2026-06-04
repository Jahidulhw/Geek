import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import drugsRouter from './routes/drugs.js'
import interactionsRouter from './routes/interactions.js'
import explainRouter from './routes/explain.js'
import authRouter from './routes/auth.js'
import medsRouter from './routes/meds.js'
import newsRouter from './routes/news.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/drugs', drugsRouter)
app.use('/api/interactions', interactionsRouter)
app.use('/api/explain', explainRouter)
app.use('/api/auth', authRouter)
app.use('/api/meds', medsRouter)
app.use('/api/news', newsRouter)

app.use(express.static(path.join(__dirname, '../dist')))
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
