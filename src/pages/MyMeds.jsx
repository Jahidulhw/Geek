import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './MyMeds.module.css'

function MyMeds() {
  const { user } = useAuth()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Meds<span className={styles.dot}>.</span></h1>
      {user ? (
        <p className={styles.sub}>Your saved medications will appear here, {user.name}.</p>
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Sign in to save your meds</p>
          <p className={styles.emptySub}>Create an account to track your medications, set reminders, and check interactions.</p>
        </div>
      )}
    </div>
  )
}

export default MyMeds
