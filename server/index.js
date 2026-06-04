import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import drugsRouter from './routes/drugs.js'
import interactionsRouter from './routes/interactions.js'
import explainRouter from './routes/explain.js'
import authRouter from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/drugs', drugsRouter)
app.use('/api/interactions', interactionsRouter)
app.use('/api/explain', explainRouter)
app.use('/api/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
