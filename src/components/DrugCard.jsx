import { Link } from 'react-router-dom'
import styles from './DrugCard.module.css'

function DrugCard({ drug }) {
  return (
    <Link to={`/drug/${encodeURIComponent(drug.id)}`} className={styles.card}>
      <div className={styles.icon}>💊</div>
      <div className={styles.body}>
        <h3 className={styles.name}>{drug.brandName}</h3>
        <p className={styles.generic}>{drug.genericName}</p>
        {drug.purpose && (
          <p className={styles.purpose}>{drug.purpose.slice(0, 120)}{drug.purpose.length > 120 ? '…' : ''}</p>
        )}
        {drug.manufacturer && (
          <span className={styles.mfr}>{drug.manufacturer}</span>
        )}
      </div>
      <span className={styles.arrow}>→</span>
    </Link>
  )
}

export default DrugCard
