import { Link } from 'react-router-dom'
import styles from './About.module.css'

const FEATURES = [
  {
    num: '01',
    title: 'Drug Info',
    desc: 'Side effects, dosage, warnings — all in plain language, not medical jargon.',
    to: '/search',
  },
  {
    num: '02',
    title: 'Interaction Checker',
    desc: 'Stack multiple drugs and see what conflicts before it becomes a problem.',
    to: '/interactions',
  },
  {
    num: '03',
    title: 'My Meds Cabinet',
    desc: 'Save your medications, get reminders, track what you take daily.',
    to: '/my-meds',
  },
  {
    num: '04',
    title: 'AI Explanations',
    desc: 'Ask anything about a drug in plain English. Get a straight answer.',
    to: '/search?mode=ai',
  },
]

export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>◆ About</p>
        <h1 className={styles.heading}>
          Geek<span className={styles.dot}>.</span>
        </h1>
        <p className={styles.tagline}>Know your meds. In plain English.</p>
      </section>

      <div className={styles.content}>

        {/* ── Mission ── */}
        <section className={styles.section}>
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>◆ Our mission</span>
            <div className={styles.dividerLine} />
          </div>
          <p className={styles.body}>
            Drug labels are written for doctors, not people. We got tired of Googling side
            effects and ending up more confused than before. So we built Geek, a place where
            you can look up any medication and actually understand what it does, how to take
            it, and what to watch out for. No paywalls. Just straight answers.
          </p>
        </section>

        {/* ── Features ── */}
        <section className={styles.section}>
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>◆ What Geek does</span>
            <div className={styles.dividerLine} />
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map(({ num, title, desc, to }) => (
              <Link key={num} to={to} className={styles.featureCard}>
                <span className={styles.featureNum}>{num}</span>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
                <span className={styles.featureArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Who is this for ── */}
        <section className={styles.section}>
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>◆ Who is this for?</span>
            <div className={styles.dividerLine} />
          </div>
          <p className={styles.body}>
            Anyone who takes medication. Whether you just got a new prescription, want to
            check if two drugs interact, or just want to actually understand what you're
            putting in your body.
          </p>
        </section>

        {/* ── Disclaimer ── */}
        <section className={styles.disclaimerWrap}>
          <div className={styles.disclaimer}>
            <span className={styles.disclaimerIcon}>⚕</span>
            <p className={styles.disclaimerText}>
              Geek is not a substitute for professional medical advice. Always consult your
              doctor or pharmacist before making any health decisions.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
