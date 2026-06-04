import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import styles from './InteractionChecker.module.css'

const API = import.meta.env.VITE_API_URL ?? ''
const MAX_DRUGS = 10

const SEVERITY_LABELS = { mild: 'Mild', moderate: 'Moderate', severe: 'Severe' }

function DrugSearch({ onAdd, disabled }) {
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [fetching, setFetching] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const q = input.trim()
    if (!q) { setSuggestions([]); setOpen(false); return }
    const timer = setTimeout(async () => {
      setFetching(true)
      try {
        const { data } = await axios.get(`${API}/api/drugs`, { params: { q } })
        setSuggestions(data.slice(0, 6))
        setOpen(true)
      } catch {
        setSuggestions([])
      } finally {
        setFetching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [input])

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function select(drug) {
    onAdd(drug)
    setInput('')
    setSuggestions([])
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'Enter' && input.trim()) {
      if (suggestions.length) {
        select(suggestions[0])
      } else {
        const name = input.trim()
        onAdd({ id: name.toLowerCase(), brandName: name, genericName: '' })
        setInput('')
      }
    }
  }

  return (
    <div ref={wrapRef} className={styles.searchWrap}>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder="Search medication…"
          disabled={disabled}
          autoComplete="off"
        />
        {fetching && <span className={styles.spinner} />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {suggestions.map(drug => (
            <li
              key={drug.id}
              className={styles.suggestion}
              onMouseDown={() => select(drug)}
            >
              <span className={styles.suggName}>{drug.brandName}</span>
              {drug.genericName && drug.genericName !== drug.brandName && (
                <span className={styles.suggGeneric}>{drug.genericName}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SeverityBadge({ severity }) {
  return (
    <span className={`${styles.badge} ${styles[`badge_${severity}`]}`}>
      {SEVERITY_LABELS[severity] ?? severity}
    </span>
  )
}

function InteractionChecker() {
  const [drugs, setDrugs] = useState([])
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState(null)

  function addDrug(drug) {
    if (drugs.length >= MAX_DRUGS) return
    if (drugs.some(d => d.id === drug.id)) return
    setDrugs(prev => [...prev, drug])
    setResults(null)
  }

  function removeDrug(id) {
    setDrugs(prev => prev.filter(d => d.id !== id))
    setResults(null)
  }

  async function checkInteractions() {
    if (drugs.length < 2) return
    setChecking(true)
    setResults(null)
    try {
      const { data } = await axios.post(`${API}/api/interactions`, {
        drugs: drugs.map(d => d.brandName),
      })
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setChecking(false)
    }
  }

  const canCheck = drugs.length >= 2

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Check<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.sub}>Add medications to see how they interact.</p>
      </div>

      <DrugSearch onAdd={addDrug} disabled={drugs.length >= MAX_DRUGS} />

      {drugs.length > 0 && (
        <div className={styles.pillRow}>
          {drugs.map(drug => (
            <span key={drug.id} className={styles.pill}>
              {drug.brandName}
              <button
                className={styles.pillRemove}
                onClick={() => removeDrug(drug.id)}
                aria-label={`Remove ${drug.brandName}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {!canCheck && (
        <p className={styles.hint}>Add at least 2 medications to check.</p>
      )}

      {canCheck && (
        <button
          className={styles.checkBtn}
          onClick={checkInteractions}
          disabled={checking}
        >
          {checking ? 'Checking…' : 'Check Interactions →'}
        </button>
      )}

      {results !== null && (
        <div className={styles.results}>
          <p className={styles.resultsLabel}>
            {results.length} interaction{results.length !== 1 ? 's' : ''} found
          </p>
          {results.length === 0 && (
            <p className={styles.noResults}>No interaction data available.</p>
          )}
          {results.map((r, i) => (
            <div key={i} className={`${styles.card} ${styles[`card_${r.severity}`]}`}>
              <div className={styles.cardTop}>
                <div className={styles.drugPair}>
                  <span className={styles.drugName}>{r.drug1}</span>
                  <span className={styles.plus}>+</span>
                  <span className={styles.drugName}>{r.drug2}</span>
                </div>
                <SeverityBadge severity={r.severity} />
              </div>
              <p className={styles.description}>{r.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InteractionChecker
