import { useEffect, useRef } from 'react'
import styles from './FloatingPills.module.css'

// ── SVG building blocks ──────────────────────────────────────────────────────

function CapsuleSvg({ w, h, c1, c2, uid }) {
  const r = h / 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Hard 50/50 split for two-tone halves */}
        <linearGradient id={`fp-cg-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
        </linearGradient>
        {/* Top-edge highlight sheen */}
        <linearGradient id={`fp-ch-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.38)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx={r} fill={`url(#fp-cg-${uid})`} />

      {/* Seam line at centre */}
      <line
        x1={w / 2} y1={r * 0.25}
        x2={w / 2} y2={h - r * 0.25}
        stroke="rgba(0,0,0,0.45)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* Highlight streak — spans the straight section, top portion only */}
      <rect
        x={r * 1.2}
        y={h * 0.11}
        width={Math.max(0, w - r * 2.4)}
        height={h * 0.30}
        rx={h * 0.13}
        fill={`url(#fp-ch-${uid})`}
      />
    </svg>
  )
}

function TabletSvg({ size: s, c1, c2, uid }) {
  const cx = s / 2
  const cy = s / 2
  const r  = s / 2 - 0.5
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Slight radial depth — lighter off-centre */}
        <radialGradient id={`fp-tg-${uid}`} cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2={s} y2={s}>
          <stop offset="0%"   stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        {/* Specular highlight */}
        <radialGradient id={`fp-th-${uid}`} cx="50%" cy="28%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.32)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </radialGradient>
      </defs>

      {/* Body */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#fp-tg-${uid})`} />

      {/* Score line across the centre */}
      <line
        x1={s * 0.20} y1={cy}
        x2={s * 0.80} y2={cy}
        stroke="rgba(0,0,0,0.40)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Specular highlight on top half */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#fp-th-${uid})`} />
    </svg>
  )
}

// ── Config ───────────────────────────────────────────────────────────────────
// Positions, opacity (op), speed (spd), blur, rotation (rot) are UNCHANGED.
// shape: 'capsule' | 'tablet'   c1/c2: two-tone colours
// Tablets use w as diameter (h ignored for tablets).

const RED1 = '#FF2D54'   // bright red — matches --red
const RED2 = '#7A0818'   // deep dark crimson

const NEUTRAL1 = '#E8DDE2'  // warm off-white
const NEUTRAL2 = '#A09098'  // muted mauve-gray

const CONFIGS = [
  { top:  10, left:  6, w:  88, h: 30, rot: -22, op: 0.10, spd: 0.08, blur: 0, shape: 'capsule', c1: RED1,      c2: RED2      },
  { top:  18, left: 88, w: 130, h: 44, rot:  18, op: 0.06, spd: 0.15, blur: 2, shape: 'capsule', c1: NEUTRAL1,  c2: NEUTRAL2  },
  { top:  33, left:  2, w:  62, h: 22, rot:  42, op: 0.08, spd: 0.05, blur: 0, shape: 'capsule', c1: RED1,      c2: RED2      },
  { top:  25, left: 93, w:  40, h: 40, rot: -10, op: 0.05, spd: 0.20, blur: 3, shape: 'tablet',  c1: NEUTRAL1,  c2: NEUTRAL2  },
  { top:  55, left: 14, w: 112, h: 38, rot:  24, op: 0.07, spd: 0.10, blur: 1, shape: 'capsule', c1: RED1,      c2: '#900A20' },
  { top:  48, left: 80, w:  68, h: 24, rot: -35, op: 0.06, spd: 0.13, blur: 2, shape: 'capsule', c1: NEUTRAL1,  c2: '#807078' },
  { top:  70, left: 50, w:  50, h: 50, rot:   6, op: 0.04, spd: 0.06, blur: 3, shape: 'tablet',  c1: RED1,      c2: '#580A16' },
  { top:  78, left: 91, w:  76, h: 26, rot: -18, op: 0.08, spd: 0.17, blur: 1, shape: 'capsule', c1: NEUTRAL1,  c2: '#B8A0A8' },
  { top:  88, left: 22, w:  38, h: 38, rot:  14, op: 0.05, spd: 0.09, blur: 2, shape: 'tablet',  c1: RED1,      c2: RED2      },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingPills() {
  const refs   = useRef([])
  const scroll = useRef(0)
  const raf    = useRef(null)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) return

    let ticking = false

    function onScroll() {
      scroll.current = window.scrollY
      if (!ticking) {
        ticking = true
        raf.current = requestAnimationFrame(() => {
          refs.current.forEach((el, i) => {
            if (!el) return
            const y = -scroll.current * CONFIGS[i].spd
            el.style.transform = `translateY(${y}px) rotate(${CONFIGS[i].rot}deg)`
          })
          ticking = false
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf.current)
    }
  }, [reduced])

  return (
    <div className={styles.layer} aria-hidden="true">
      {CONFIGS.map((c, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          className={styles.pill}
          style={{
            top:       `${c.top}%`,
            left:      `${c.left}%`,
            opacity:   c.op,
            filter:    c.blur ? `blur(${c.blur}px)` : undefined,
            transform: `translateY(0px) rotate(${c.rot}deg)`,
          }}
        >
          {c.shape === 'tablet'
            ? <TabletSvg  size={c.w} c1={c.c1} c2={c.c2} uid={i} />
            : <CapsuleSvg w={c.w} h={c.h} c1={c.c1} c2={c.c2} uid={i} />
          }
        </div>
      ))}
    </div>
  )
}
