import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import AiChatDrawer from './AiChat'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconHamburger() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <line x1="0" y1="1"  x2="20" y2="1"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="7"  x2="20" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2C5.582 2 2 5.134 2 9c0 1.9.83 3.62 2.18 4.9L3 18l4.5-1.8C8.26 16.38 9.11 16.5 10 16.5c4.418 0 8-3.134 8-7s-3.582-7.5-8-7.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconCapsule() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden="true">
      <rect x="0.7" y="0.7" width="20.6" height="10.6" rx="5.3" stroke="currentColor" strokeWidth="1.4" />
      <line x1="11" y1="1.5" x2="11" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.3 0.7H11v10.6H5.3A5.3 5.3 0 0 1 0.7 6a5.3 5.3 0 0 1 4.6-5.3z" fill="currentColor" fillOpacity="0.12" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Drawer ───────────────────────────────────────────────────────────────────

function Drawer({ open, onClose }) {
  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <button className={styles.drawerClose} onClick={onClose} aria-label="Close menu">
          <IconClose />
        </button>
        <nav className={styles.drawerNav}>
          <NavLink to="/search"       onClick={onClose} className={({ isActive }) => isActive ? styles.drawerLinkActive : styles.drawerLink}>Search</NavLink>
          <NavLink to="/interactions" onClick={onClose} className={({ isActive }) => isActive ? styles.drawerLinkActive : styles.drawerLink}>Interactions</NavLink>
          <NavLink to="/my-meds"      onClick={onClose} className={({ isActive }) => isActive ? styles.drawerLinkActive : styles.drawerLink}>My Meds</NavLink>
          <NavLink to="/about"        onClick={onClose} className={({ isActive }) => isActive ? styles.drawerLinkActive : styles.drawerLink}>About</NavLink>
        </nav>
      </div>
    </>
  )
}

// ── User button ───────────────────────────────────────────────────────────────

function UserButton({ onOpenModal }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!user) {
    return (
      <button className={styles.iconBtn} onClick={onOpenModal} aria-label="Sign in">
        <IconUser />
      </button>
    )
  }

  const initial = (user.name || user.email)[0].toUpperCase()

  return (
    <div className={styles.userWrap}>
      <button
        className={styles.avatar}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Account menu"
      >
        {initial}
      </button>
      {menuOpen && (
        <>
          <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
          <div className={styles.menu}>
            <p className={styles.menuName}>{user.name}</p>
            <p className={styles.menuEmail}>{user.email}</p>
            <button
              className={styles.menuLogout}
              onClick={() => { logout(); setMenuOpen(false) }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [drawerOpen, setDrawerOpen]   = useState(false)
  const [authModalOpen, setAuthModal] = useState(false)
  const [chatOpen, setChatOpen]       = useState(false)

  return (
    <>
      <header className={styles.header}>
        <div className={styles.nav}>

          {/* Left */}
          <div className={styles.side}>
            <button className={styles.iconBtn} onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <IconHamburger />
            </button>
            <Link to="/search" className={styles.searchLink}>Search</Link>
          </div>

          {/* Centre */}
          <Link to="/" className={styles.logo}>
            Geek<span className={styles.dot}>.</span>
          </Link>

          {/* Right */}
          <div className={`${styles.side} ${styles.sideRight}`}>
            <button
              className={`${styles.iconBtn} ${styles.desktopOnly}`}
              onClick={() => setChatOpen(true)}
              aria-label="Open AI chat"
            >
              <IconChat />
            </button>

            <UserButton onOpenModal={() => setAuthModal(true)} />

            <Link to="/my-meds" className={`${styles.iconBtn} ${styles.desktopOnly}`} aria-label="My Meds">
              <IconCapsule />
            </Link>
          </div>

        </div>
      </header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <AiChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
      {authModalOpen && <AuthModal onClose={() => setAuthModal(false)} />}
    </>
  )
}
