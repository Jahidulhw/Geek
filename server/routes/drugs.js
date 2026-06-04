import { Router } from 'express'

const router = Router()
const FDA_BASE = 'https://api.fda.gov/drug/label.json'

function mapLabel(item) {
  const openfda = item.openfda ?? {}
  return {
    id:           openfda.application_number?.[0] ?? openfda.brand_name?.[0] ?? openfda.generic_name?.[0] ?? '',
    brandName:    openfda.brand_name?.[0]          ?? 'Unknown',
    genericName:  openfda.generic_name?.[0]        ?? 'Unknown',
    manufacturer: openfda.manufacturer_name?.[0]   ?? '',
    purpose:      item.purpose?.[0]                ?? item.indications_and_usage?.[0] ?? '',
    dosage:       item.dosage_and_administration?.[0] ?? '',
    warnings:     item.warnings?.[0]               ?? item.warnings_and_cautions?.[0] ?? '',
    sideEffects:  item.adverse_reactions?.[0]      ?? '',
    interactions: item.drug_interactions?.[0]      ?? '',
  }
}

router.get('/', async (req, res) => {
  const { q } = req.query
  if (!q?.trim()) return res.json([])

  try {
    const url = `${FDA_BASE}?search=openfda.brand_name:"${encodeURIComponent(q.trim())}"&limit=10`
    const response = await fetch(url)
    if (response.status === 404) return res.json([])
    if (!response.ok) throw new Error(`FDA API ${response.status}`)
    const data = await response.json()
    res.json((data.results ?? []).map(mapLabel))
  } catch (err) {
    console.error('FDA search error:', err.message)
    res.json([])
  }
})

router.get('/:id', async (req, res) => {
  const id = decodeURIComponent(req.params.id)
  // Capitalize first letter so "adderall" → "Adderall" for brand-name match
  const titled = id.charAt(0).toUpperCase() + id.slice(1).toLowerCase()

  const strategies = [
    `openfda.application_number:"${encodeURIComponent(id)}"`,
    `openfda.brand_name:"${encodeURIComponent(id)}"`,
    `openfda.brand_name:"${encodeURIComponent(titled)}"`,
    `openfda.generic_name:"${encodeURIComponent(titled)}"`,
  ]

  for (const search of strategies) {
    try {
      const response = await fetch(`${FDA_BASE}?search=${search}&limit=1`)
      if (response.status === 404) continue
      if (!response.ok) continue
      const data = await response.json()
      const item = data.results?.[0]
      if (item) return res.json(mapLabel(item))
    } catch {
      // try next strategy
    }
  }

  res.status(404).json({ error: 'Not found' })
})

export default router
