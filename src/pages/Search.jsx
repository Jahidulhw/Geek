import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DrugCard from '../components/DrugCard'
import styles from './Search.module.css'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

function SkeletonCard() {
  return (
    <div className={styles.skeleton}>
      <div className={`${styles.skPulse} ${styles.skIcon}`} />
      <div className={styles.skBody}>
        <div className={`${styles.skPulse} ${styles.skLine} ${styles.skTitle}`} />
        <div className={`${styles.skPulse} ${styles.skLine} ${styles.skSub}`} />
        <div className={`${styles.skPulse} ${styles.skLine} ${styles.skDesc}`} />
      </div>
    </div>
  )
}

function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (query) => {
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await axios.get(`${API}/api/drugs`, { params: { q } })
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setInput(q)
      doSearch(q)
    }
  }, [searchParams, doSearch])

  function handleSubmit(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q) return
    navigate(`/search?q=${encodeURIComponent(q)}`)
    doSearch(q)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Search<span className={styles.dot}>.</span></h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Brand name, generic name…"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button type="submit" className={styles.btn}>Search</button>
        </form>
      </div>

      <div className={styles.results}>
        {loading && (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        )}

        {!loading && searched && results.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyTitle}>No results found</p>
            <p className={styles.emptySub}>Try a brand name like "Adderall" or a generic like "sertraline"</p>
          </div>
        )}

        {!loading && results.map(drug => (
          <DrugCard key={drug.id} drug={drug} />
        ))}
      </div>
    </div>
  )
}

export default Search
