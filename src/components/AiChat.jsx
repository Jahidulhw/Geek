import { useState, useRef, useEffect } from 'react'
import styles from './AiChat.module.css'

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TypingDots() {
  return (
    <div className={styles.typing}>
      <span className={styles.dot1} />
      <span className={styles.dot2} />
      <span className={styles.dot3} />
    </div>
  )
}

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export default function AiChatDrawer({ open, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const textareaRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res  = await fetch(`${BASE_URL}/api/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply || data.error || 'No response received.' },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInput(e) {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`} role="dialog" aria-label="Geek AI chat">

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.statusDot} />
            <span className={styles.title}>Geek <span className={styles.aiLabel}>AI</span></span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close chat">
            <IconClose />
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>💊</div>
              <p className={styles.emptyTitle}>Ask me about any medication</p>
              <p className={styles.emptyHint}>Side effects · Dosages · Drug interactions</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.msg} ${msg.role === 'user' ? styles.msgUser : styles.msgAi}`}
            >
              {msg.role === 'assistant' && <div className={styles.aiBadge}>AI</div>}
              <div className={styles.msgBubble}>{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.msg} ${styles.msgAi}`}>
              <div className={styles.aiBadge}>AI</div>
              <div className={styles.msgBubble}><TypingDots /></div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className={styles.inputRow}>
          <textarea
            ref={textareaRef}
            className={styles.input}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a medication…"
            rows={1}
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <IconSend />
          </button>
        </div>

        <p className={styles.disclaimer}>Not medical advice · Always consult a doctor</p>
      </div>
    </>
  )
}
