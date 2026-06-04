import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import styles from './Home.module.css'
import FloatingPills from '../components/FloatingPills'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

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


function SectionDivider({ label }) {
  return (
    <div className={styles.divider}>
      <span className={styles.dividerLabel}>{label}</span>
      <div className={styles.dividerLine} />
    </div>
  )
}

// Curated medicine/pharmacy Unsplash photos — used when an article has no image
// or when the article's image URL fails to load.
const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=520&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=520&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1550831107-1553da8c8464?w=520&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=520&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=520&h=280&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=520&h=280&fit=crop&auto=format',
]

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function NewsCard({ article, index }) {
  const fallback = FALLBACK_IMGS[index % FALLBACK_IMGS.length]
  const [src, setSrc] = useState(article.urlToImage || fallback)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.newsCard}
    >
      <div className={styles.newsThumb}>
        <img
          src={src}
          alt=""
          loading="lazy"
          className={styles.newsImg}
          onError={() => setSrc(fallback)}
        />
      </div>
      <div className={styles.newsBody}>
        <p className={styles.newsMeta}>
          <span className={styles.newsSource}>{article.source}</span>
          <span className={styles.newsDot}>·</span>
          <span className={styles.newsTime}>{timeAgo(article.publishedAt)}</span>
        </p>
        <h3 className={styles.newsTitle}>{article.title}</h3>
      </div>
    </a>
  )
}

function Home() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [news, setNews]         = useState([])
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API}/api/news`)
      .then(({ data }) => setNews(data))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false))
  }, [])

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


          <p className={styles.subtitle}>Know your meds. Track your meds.</p>

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

      {/* ── Drug News ── */}
      <section className={styles.section}>
        <SectionDivider label="◆ Drug News" />
        {newsLoading ? (
          <div className={styles.newsRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.newsSkeleton}>
                <div className={`${styles.skPulse} ${styles.skNewsThumb}`} />
                <div className={styles.skNewsBody}>
                  <div className={`${styles.skPulse} ${styles.skNewsLine1}`} />
                  <div className={`${styles.skPulse} ${styles.skNewsLine2}`} />
                  <div className={`${styles.skPulse} ${styles.skNewsLine3}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.newsRow}>
            {news.map((article, i) => (
              <NewsCard key={i} article={article} index={i} />
            ))}
          </div>
        )}
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
