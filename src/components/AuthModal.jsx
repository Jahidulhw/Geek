import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './AuthModal.module.css'

export default function AuthModal({ onClose }) {
  const { login, signup } = useAuth()
  const [tab, setTab] = useState('login')        // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const firstInput = useRef(null)

  useEffect(() => { firstInput.current?.focus() }, [tab])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(email, password)
      } else {
        await signup(email, password, name)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Sign in
          </button>
          <button
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => { setTab('signup'); setError('') }}
          >
            Create account
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'signup' && (
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                ref={tab === 'signup' ? firstInput : null}
                className={styles.input}
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              ref={tab === 'login' ? firstInput : null}
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Just a sec…' : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className={styles.switch}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className={styles.switchBtn}
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {tab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </div>
    </div>
  )
}
