import { Router } from 'express'

const router = Router()

// ── Prompt ───────────────────────────────────────────────────────────────────

const RULES = `
STRICT RULES — follow every one:
1. Remove ALL citation numbers and cross-references: (5.1), [see Warnings (5.1)], (see section 4), etc.
2. Remove legal/clinical boilerplate: "patients should be advised", "it is recommended that", "healthcare provider should be notified", "as directed by your doctor".
3. No medical jargon. If you must use a term, define it in the same sentence.
4. Write in second person ("you"/"your") — not "the patient" or "patients".
5. Be honest — do not soften serious warnings or real risks.
6. 2–3 sentences maximum. Short, direct, punchy.
7. Vary your sentence openings.
`.trim()

const BATCH_PROMPT = (drugName, sections) => `
Rewrite the following FDA label sections for "${drugName}" so a regular person can understand them.
${RULES}

Return ONLY a raw JSON object — no markdown fences, no extra text, no explanation.
Shape: { "key": "plain-English rewrite", ... }

Sections:
${sections.map(s => `"${s.key}" — ${s.label}:\n${s.content.slice(0, 700)}`).join('\n\n')}
`.trim()

const SINGLE_PROMPT = (section, drugName, content) => `
Rewrite this "${section}" section for "${drugName}" so a regular person can understand it.
${RULES}

Return only the rewritten text — no JSON, no labels, no quotes around it.

FDA text:
${content.slice(0, 900)}
`.trim()

// ── Text cleaning helpers ─────────────────────────────────────────────────────

function stripJson(raw) {
  // Strip optional markdown fences: ```json ... ``` or ``` ... ```
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/,           '')
    .trim()
}

function basicFallback(content) {
  return content
    .replace(/^\d+[\d.]*\s+(?:[A-Z]+\s+)*/g, '') // "5.1 WARNINGS AND PRECAUTIONS "
    .replace(/\(\s*\d[\d.]*\s*\)/g, '')            // (5.1)
    .replace(/\[see [^\]]+\]/gi, '')               // [see Warnings]
    .replace(/\(see [^)]+\)/gi, '')                // (see section 4.3)
    .replace(/patients? should (be advised|consult|notify)[^.]+\./gi, '')
    .replace(/it is recommended that[^.]+\./gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?]+[.!?]+/g)
    ?.slice(0, 2).join(' ').trim() ?? content.slice(0, 200)
}

// ── AI caller (Groq preferred, Anthropic fallback) ───────────────────────────

async function callAI(prompt, maxTokens = 1200) {
  const groqKey      = process.env.GROQ_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (groqKey) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: maxTokens,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Groq API ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() ?? ''
  }

  if (anthropicKey) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        messages:   [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic API ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text?.trim() ?? ''
  }

  return null  // no key configured
}

// ── Batch ─────────────────────────────────────────────────────────────────────

router.post('/batch', async (req, res) => {
  const { sections, drugName } = req.body
  if (!sections?.length || !drugName) {
    return res.status(400).json({ error: 'sections and drugName required' })
  }

  const buildFallback = () => {
    const out = {}
    sections.forEach(s => { out[s.key] = basicFallback(s.content) })
    return out
  }

  const hasKey = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!hasKey) return res.json(buildFallback())

  try {
    const raw    = await callAI(BATCH_PROMPT(drugName, sections), 1200)
    const parsed = JSON.parse(stripJson(raw))
    const out    = {}
    sections.forEach(s => { out[s.key] = parsed[s.key]?.trim() || basicFallback(s.content) })
    res.json(out)
  } catch (err) {
    console.error('Batch explain error:', err.message)
    res.json(buildFallback())
  }
})

// ── Severity ──────────────────────────────────────────────────────────────────

router.post('/severity', async (req, res) => {
  const { sideEffectsText } = req.body
  if (!sideEffectsText) return res.status(400).json({ error: 'sideEffectsText required' })

  const hasKey = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!hasKey) return res.json({ severity: null })

  const prompt = `Classify the overall severity of these drug side effects as exactly one word — either Mild, Moderate, or Severe. Reply with ONLY that single word, nothing else.\n\nSide effects: ${sideEffectsText.slice(0, 500)}`

  try {
    const text     = await callAI(prompt, 20)
    const severity = ['Mild', 'Moderate', 'Severe'].find(s => text.includes(s)) ?? null
    res.json({ severity })
  } catch (err) {
    console.error('Severity error:', err.message)
    res.json({ severity: null })
  }
})

// ── Single ────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const { section, content, drugName } = req.body
  if (!content) return res.status(400).json({ error: 'No content provided' })

  const hasKey = process.env.GROQ_API_KEY || process.env.ANTHROPIC_API_KEY
  if (!hasKey) return res.json({ explanation: basicFallback(content) })

  try {
    const text = await callAI(SINGLE_PROMPT(section, drugName, content), 300)
    res.json({ explanation: text || basicFallback(content) })
  } catch (err) {
    console.error('Explain error:', err.message)
    res.json({ explanation: basicFallback(content) })
  }
})

export default router
