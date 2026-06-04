import { Router } from 'express'

const router = Router()
const FDA_BASE = 'https://api.fda.gov/drug/label.json'

function detectSeverity(text) {
  const t = text.toLowerCase()
  if (/contraindicated|fatal|life.?threatening|do not (use|take)|avoid combination|should not be (used|taken)/i.test(t)) {
    return 'severe'
  }
  if (/serious|significant|caution|monitor|may (increase|decrease|affect)|concurrent|concurrent use|potential|interact/i.test(t)) {
    return 'moderate'
  }
  return 'mild'
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function fetchLabel(drugName) {
  const searches = [
    `openfda.brand_name:"${encodeURIComponent(drugName)}"`,
    `openfda.generic_name:"${encodeURIComponent(drugName)}"`,
  ]
  for (const search of searches) {
    try {
      const res = await fetch(`${FDA_BASE}?search=${search}&limit=1`)
      if (res.status === 404) continue
      if (!res.ok) continue
      const data = await res.json()
      const item = data.results?.[0]
      if (item) return item
    } catch {
      // try next
    }
  }
  return null
}

router.post('/', async (req, res) => {
  const { drugs } = req.body
  if (!Array.isArray(drugs) || drugs.length < 2) {
    return res.status(400).json({ error: 'Provide at least 2 drug names' })
  }

  const pairs = []
  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      pairs.push([drugs[i], drugs[j]])
    }
  }

  const results = await Promise.all(
    pairs.map(async ([drug1, drug2]) => {
      const label = await fetchLabel(drug1)
      const interactionText = label?.drug_interactions?.[0] ?? ''

      if (interactionText) {
        const rx = new RegExp(escapeRegex(drug2), 'i')
        if (rx.test(interactionText)) {
          const sentences = interactionText.split(/(?<=[.!?])\s+/)
          const hit = sentences.find(s => rx.test(s)) ?? interactionText.slice(0, 300)
          const snippet = hit.trim().replace(/\s+/g, ' ')
          return {
            drug1,
            drug2,
            severity: detectSeverity(snippet),
            description: snippet.endsWith('.') ? snippet : snippet + '.',
          }
        }
      }

      // Fallback mock — honest about data gap
      return {
        drug1,
        drug2,
        severity: 'mild',
        description: `No specific interaction between ${drug1} and ${drug2} was found in the FDA label database. This does not mean they are safe to combine — always verify with a pharmacist.`,
      }
    })
  )

  res.json(results)
})

export default router
