import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './DrugInfo.module.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

const SECTIONS = [
  { key: 'purpose',      label: 'What is it?',       emoji: '💊' },
  { key: 'dosage',       label: 'How to take it',     emoji: '📋' },
  { key: 'sideEffects',  label: 'Side effects',       emoji: '⚡' },
  { key: 'warnings',     label: 'Heads up',           emoji: '⚠️' },
  { key: 'interactions', label: 'Drug interactions',  emoji: '🔄' },
]

function Section({ label, emoji, content, explanation, loadingExpl, defaultOpen }) {
  const [open, setOpen]       = useState(defaultOpen)
  const [showRaw, setShowRaw] = useState(false)

  if (!content) return null

  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className={styles.sectionLeft}>
          <span className={styles.emoji}>{emoji}</span>
          <span className={styles.sectionLabel}>{label}</span>
        </div>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>▾</span>
      </button>

      {open && (
        <div className={styles.sectionBody}>

          {/* While batch is loading, show a skeleton */}
          {loadingExpl && !explanation && (
            <div className={styles.explSkeleton}>
              <div className={`${styles.skPulse} ${styles.skLine} ${styles.skW80}`} />
              <div className={`${styles.skPulse} ${styles.skLine} ${styles.skW60}`} />
              <div className={`${styles.skPulse} ${styles.skLine} ${styles.skW70}`} />
            </div>
          )}

          {/* Plain-English summary — always shown once batch returns */}
          {!loadingExpl && explanation && (
            <p className={styles.plainText}>{explanation}</p>
          )}

          {/* Raw FDA label toggle — available but secondary */}
          {!loadingExpl && (
            <button
              className={styles.rawToggle}
              onClick={e => { e.stopPropagation(); setShowRaw(r => !r) }}
            >
              {showRaw ? 'Hide full label ▾' : 'Full FDA label ▸'}
            </button>
          )}

          {showRaw && <p className={styles.rawText}>{content}</p>}
        </div>
      )}
    </div>
  )
}

function SkeletonHeader() {
  return (
    <div className={styles.skHeader}>
      <div className={`${styles.skPulse} ${styles.skName}`} />
      <div className={`${styles.skPulse} ${styles.skGeneric}`} />
      <div className={`${styles.skPulse} ${styles.skTag}`} />
    </div>
  )
}

function DrugInfo() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [drug, setDrug]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [explanations, setExplanations] = useState({})
  const [loadingExpl, setLoadingExpl]   = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setExplanations({})

    axios.get(`${API}/api/drugs/${encodeURIComponent(id)}`)
      .then(({ data }) => {
        setDrug(data)

        const toExplain = SECTIONS
          .filter(s => data[s.key])
          .map(s => ({ key: s.key, label: s.label, content: data[s.key] }))

        if (!toExplain.length) return

        setLoadingExpl(true)
        axios
          .post(`${API}/api/explain/batch`, { sections: toExplain, drugName: data.brandName })
          .then(({ data: expl }) => setExplanations(expl))
          .catch(err => {
            console.error('Batch explain failed:', err.message)
            // On failure, show cleaned raw text for each section
            const fallback = {}
            toExplain.forEach(s => { fallback[s.key] = s.content })
            setExplanations(fallback)
          })
          .finally(() => setLoadingExpl(false))
      })
      .catch(err => {
        setError(err.response?.status === 404 ? 'Drug not found.' : 'Failed to load drug info.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <SkeletonHeader />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${styles.skPulse} ${styles.skSection}`} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <p className={styles.errorTitle}>{error}</p>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>← Go back</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.name}>{drug.brandName}</h1>
            <p className={styles.generic}>{drug.genericName}</p>
          </div>
          <button className={styles.addBtn}>+ My Meds</button>
        </div>
        {drug.manufacturer && (
          <span className={styles.mfrTag}>{drug.manufacturer}</span>
        )}
      </div>

      <div className={styles.sections}>
        {SECTIONS.map(({ key, label, emoji }, i) => (
          <Section
            key={key}
            label={label}
            emoji={emoji}
            content={drug[key]}
            explanation={explanations[key] ?? null}
            loadingExpl={loadingExpl}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  )
}

export default DrugInfo
