import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Home.module.css'
import FloatingPills from '../components/FloatingPills'

const CATEGORIES = [
  { label: 'Pain & Fever',            drugs: ['Ibuprofen', 'Acetaminophen', 'Aspirin', 'Naproxen', 'Tramadol'] },
  { label: 'Mental Health',           drugs: ['Adderall', 'Zoloft', 'Xanax', 'Lexapro', 'Prozac', 'Wellbutrin', 'Vyvanse', 'Klonopin'] },
  { label: 'Sleep & Supplements',     drugs: ['Melatonin', 'Magnesium', 'Vitamin D', 'Zinc', 'Benadryl'] },
  { label: 'Chronic & Metabolic',     drugs: ['Ozempic', 'Metformin', 'Lisinopril', 'Atorvastatin', 'Levothyroxine', 'Omeprazole'] },
  { label: 'Antibiotics & Antivirals',drugs: ['Amoxicillin', 'Azithromycin', 'Doxycycline', 'Tamiflu'] },
]


const FEATURES = [
  { num: '01', title: 'Drug Info',           desc: 'Side effects, dosage, warnings — all in plain language, not medical jargon.', to: '/search'          },
  { num: '02', title: 'Interaction Checker', desc: 'Stack multiple drugs and see what conflicts before it becomes a problem.',      to: '/interactions'    },
  { num: '03', title: 'My Meds Cabinet',     desc: 'Save your medications, get reminders, track what you take daily.',             to: '/my-meds'         },
  { num: '04', title: 'AI Explanations',     desc: 'Ask anything about a drug in plain English. Get a straight answer.',           to: '/search?mode=ai'  },
]

const TRENDING = [
  { icon: '💊', name: 'Adderall',   generic: 'Amphetamine',        tags: ['ADHD', 'Stimulant']       },
  { icon: '🔵', name: 'Zoloft',     generic: 'Sertraline',         tags: ['Antidepressant', 'SSRI']   },
  { icon: '💉', name: 'Ozempic',    generic: 'Semaglutide',        tags: ['Diabetes', 'Weight Loss']  },
  { icon: '🟡', name: 'Xanax',      generic: 'Alprazolam',         tags: ['Anxiety', 'Benzodiazepine']},
  { icon: '🟢', name: 'Lexapro',    generic: 'Escitalopram',       tags: ['Antidepressant', 'SSRI']   },
  { icon: '🔴', name: 'Ibuprofen',  generic: 'Ibuprofen',          tags: ['Pain Relief', 'NSAID']     },
]

function SectionDivider({ label }) {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerLabel}>{label}</span>
      <div className={styles.dividerLine} />
    </div>
  )
}

function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  function handlePillClick(pill) {
    navigate(`/search?q=${encodeURIComponent(pill)}`)
  }

  return (
    <div className={styles.page}>
      <FloatingPills />

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.glow} />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>◆ Drug info</p>
          <h1 className={styles.heading}>
            Geek<span className={styles.dot}>.</span>
          </h1>


          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search a drug…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className={styles.searchBtn}>
              Geek it →
            </button>
          </form>

          <div className={styles.categories}>
            {CATEGORIES.map(({ label, drugs }) => (
              <div key={label} className={styles.category}>
                <span className={styles.categoryLabel}>{label}</span>
                <div className={styles.pillRow}>
                  {drugs.map(drug => (
                    <button
                      key={drug}
                      className={styles.pill}
                      onClick={() => handlePillClick(drug)}
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Features ── */}
      <section className={styles.section}>
        <SectionDivider label="◆ What Geek does" />
        <div className={styles.featureList}>
          {FEATURES.map(({ num, title, desc, to }) => (
            <Link key={num} to={to} className={styles.featureRow}>
              <span className={styles.featureNum}>{num}</span>
              <div className={styles.featureBody}>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
              <span className={styles.featureArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending ── */}
      <section className={styles.section}>
        <SectionDivider label="◆ Trending" />
        <div className={styles.grid}>
          {TRENDING.map(({ icon, name, generic, tags }) => (
            <Link
              key={name}
              to={`/drug/${name.toLowerCase()}`}
              className={styles.card}
            >
              <span className={styles.cardIcon}>{icon}</span>
              <div className={styles.cardBody}>
                <h3 className={styles.cardName}>{name}</h3>
                <p className={styles.cardGeneric}>{generic}</p>
                <div className={styles.cardTags}>
                  {tags.map(tag => (
                    <span key={tag} className={styles.cardTag}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogo}>
          Geek<span className={styles.dot}>.</span>
        </Link>
        <nav className={styles.footerLinks}>
          <Link to="/search">Search</Link>
          <Link to="/interactions">Interactions</Link>
          <Link to="/my-meds">My Meds</Link>
          <Link to="/about">About</Link>
        </nav>
        <p className={styles.footerNote}>Not medical advice. Always consult a professional.</p>
      </footer>

    </div>
  )
}

export default Home
