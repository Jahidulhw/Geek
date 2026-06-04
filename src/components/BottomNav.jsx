import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const items = [
  { to: '/',             icon: '🏠', label: 'Home'    },
  { to: '/search',       icon: '🔍', label: 'Search'  },
  { to: '/interactions', icon: '⚡', label: 'Check'   },
  { to: '/my-meds',      icon: '🗂️', label: 'My Meds' },
]

function BottomNav() {
  return (
    <nav className={styles.nav}>
      {items.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `${styles.item} ${isActive ? styles.active : ''}`
          }
        >
          <span className={styles.icon}>{icon}</span>
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
