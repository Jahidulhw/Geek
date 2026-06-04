import { Router } from 'express'
import { users, requireAuth } from '../store.js'

const router = Router()

// GET /api/meds — return user's saved meds
router.get('/', requireAuth, (req, res) => {
  res.json(req.user.meds ?? [])
})

// POST /api/meds — add a drug to user's list
router.post('/', requireAuth, (req, res) => {
  const { id, brandName, genericName, manufacturer } = req.body
  if (!id || !brandName) return res.status(400).json({ error: 'id and brandName required' })

  if (!req.user.meds) req.user.meds = []

  if (req.user.meds.some(m => m.id === id)) {
    return res.json({ added: false, meds: req.user.meds })
  }

  req.user.meds.push({
    id,
    brandName,
    genericName:  genericName  ?? '',
    manufacturer: manufacturer ?? '',
    savedAt:      new Date().toISOString(),
  })
  users.set(req.user.email, req.user)
  res.json({ added: true, meds: req.user.meds })
})

// DELETE /api/meds/:drugId — remove a drug
router.delete('/:drugId', requireAuth, (req, res) => {
  if (!req.user.meds) req.user.meds = []
  req.user.meds = req.user.meds.filter(
    m => m.id !== decodeURIComponent(req.params.drugId)
  )
  users.set(req.user.email, req.user)
  res.json({ meds: req.user.meds })
})

export default router
