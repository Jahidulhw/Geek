import { Router } from 'express'

const router = Router()

const SYSTEM_PROMPT =
  'You are Geek AI, a drug and medication assistant. You ONLY answer questions about medications, drugs, dosages, side effects, drug interactions, and pharmacy-related topics. If the user asks about anything outside of medications and drugs, respond with: I can only help with medication and drug-related questions. Try asking me about a specific drug, side effect, or interaction. Never break this rule under any circumstances.'

router.post('/', async (req, res) => {
  const { messages } = req.body
  if (!messages?.length) return res.status(400).json({ error: 'messages required' })

  const groqKey = process.env.GROQ_API_KEY
  if (!groqKey) return res.status(503).json({ error: 'AI not configured' })

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    })

    if (!response.ok) throw new Error(`Groq ${response.status}: ${await response.text()}`)
    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim() ?? ''
    res.json({ reply })
  } catch (err) {
    console.error('Chat error:', err.message)
    res.status(500).json({ error: 'Failed to get a response. Please try again.' })
  }
})

export default router
