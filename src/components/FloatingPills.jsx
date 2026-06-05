import { useEffect, useRef } from 'react'
import styles from './FloatingPills.module.css'

// ── SVG shapes ────────────────────────────────────────────────────────────────

function CapsuleSvg({ w, h, c1, c2, uid }) {
  const r = h / 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={`cg-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`ch-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.20)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx={r}
        fill={`url(#cg-${uid})`} />
      <line
        x1={w / 2} y1={r * 0.3}
        x2={w / 2} y2={h - r * 0.3}
        stroke="rgba(0,0,0,0.28)" strokeWidth="0.8" strokeLinecap="round"
      />
      <rect
        x={r * 1.2} y={h * 0.1}
        width={Math.max(0, w - r * 2.4)} height={h * 0.28}
        rx={h * 0.12} fill={`url(#ch-${uid})`}
      />
    </svg>
  )
}

function TabletSvg({ size: s, c1, c2, uid }) {
  const cx = s / 2, cy = s / 2, r = s / 2 - 0.5
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <defs>
        <radialGradient id={`tg-${uid}`} cx="38%" cy="32%" r="68%"
          gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        <radialGradient id={`th-${uid}`} cx="50%" cy="28%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#tg-${uid})`} />
      <line
        x1={s * 0.22} y1={cy} x2={s * 0.78} y2={cy}
        stroke="rgba(0,0,0,0.25)" strokeWidth="1" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r} fill={`url(#th-${uid})`} />
    </svg>
  )
}

// ── Pill config ───────────────────────────────────────────────────────────────
// top/left : initial viewport position (%)
// rotBase  : resting rotation angle (deg)
// speed    : translateY px per scrollY px  (negative = scrolling down → moves up)
// rotSpeed : additional degrees per scrollY px

const D1 = '#6B0F1A', D2 = '#3D0009'
const M1 = '#8B1A2A', M2 = '#4A0010'
const C1 = '#900A20', C2 = '#580A16'

const PILLS = [
  // ── capsules ──────────────────────────────────────────────────────────────
  { top:  8, left:  5, w:  88, h: 30, shape: 'capsule', c1: D1, c2: D2, rotBase: -22, speed: 0.09, rotSpeed:  0.012, op: 0.10, blur: 0 },
  { top: 15, left: 87, w: 128, h: 44, shape: 'capsule', c1: M1, c2: M2, rotBase:  18, speed: 0.15, rotSpeed: -0.008, op: 0.07, blur: 1 },
  { top: 25, left:  2, w:  62, h: 22, shape: 'capsule', c1: C1, c2: C2, rotBase:  42, speed: 0.07, rotSpeed:  0.020, op: 0.08, blur: 0 },
  { top: 32, left: 74, w: 108, h: 38, shape: 'capsule', c1: D1, c2: D2, rotBase: -35, speed: 0.13, rotSpeed: -0.015, op: 0.09, blur: 0 },
  { top: 48, left: 12, w:  72, h: 26, shape: 'capsule', c1: M1, c2: M2, rotBase:  25, speed: 0.18, rotSpeed:  0.010, op: 0.07, blur: 1 },
  { top: 56, left: 60, w:  98, h: 34, shape: 'capsule', c1: C1, c2: C2, rotBase: -15, speed: 0.11, rotSpeed: -0.018, op: 0.10, blur: 0 },
  { top: 65, left: 30, w:  78, h: 28, shape: 'capsule', c1: D1, c2: D2, rotBase:  38, speed: 0.16, rotSpeed:  0.022, op: 0.07, blur: 1 },
  { top: 73, left: 89, w: 118, h: 42, shape: 'capsule', c1: M1, c2: M2, rotBase: -28, speed: 0.20, rotSpeed: -0.009, op: 0.08, blur: 0 },
  { top: 83, left: 47, w:  52, h: 20, shape: 'capsule', c1: C1, c2: C2, rotBase:  10, speed: 0.08, rotSpeed:  0.016, op: 0.09, blur: 0 },
  { top: 91, left: 22, w:  92, h: 32, shape: 'capsule', c1: D1, c2: D2, rotBase: -42, speed: 0.17, rotSpeed: -0.013, op: 0.06, blur: 2 },
  { top: 40, left: 44, w:  68, h: 24, shape: 'capsule', c1: M1, c2: M2, rotBase:  55, speed: 0.12, rotSpeed:  0.019, op: 0.08, blur: 0 },
  { top: 20, left: 37, w:  82, h: 30, shape: 'capsule', c1: C1, c2: C2, rotBase: -50, speed: 0.14, rotSpeed: -0.011, op: 0.07, blur: 1 },
  // ── tablets ───────────────────────────────────────────────────────────────
  { top: 12, left: 52, w:  38, h: 38, shape: 'tablet',  c1: M1, c2: M2, rotBase:  14, speed: 0.10, rotSpeed:  0.014, op: 0.07, blur: 1 },
  { top: 30, left: 19, w:  50, h: 50, shape: 'tablet',  c1: C1, c2: C2, rotBase: -20, speed: 0.18, rotSpeed: -0.021, op: 0.05, blur: 2 },
  { top: 60, left: 81, w:  32, h: 32, shape: 'tablet',  c1: D1, c2: D2, rotBase:  32, speed: 0.07, rotSpeed:  0.017, op: 0.08, blur: 0 },
  { top: 46, left: 95, w:  44, h: 44, shape: 'tablet',  c1: M1, c2: M2, rotBase:  -8, speed: 0.21, rotSpeed: -0.025, op: 0.06, blur: 1 },
  { top: 77, left: 70, w:  36, h: 36, shape: 'tablet',  c1: C1, c2: C2, rotBase:  46, speed: 0.10, rotSpeed:  0.012, op: 0.09, blur: 0 },
  { top: 87, left:  8, w:  54, h: 54, shape: 'tablet',  c1: D1, c2: D2, rotBase: -36, speed: 0.19, rotSpeed: -0.020, op: 0.05, blur: 2 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingPills() {
  const refs = useRef([])

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) return

    let ticking = false

    function applyTransforms() {
      const sy = window.scrollY
      refs.current.forEach((el, i) => {
        if (!el) return
        const p = PILLS[i]
        const y = -(sy * p.speed)
        const r =   p.rotBase + sy * p.rotSpeed
        el.style.transform = `translateY(${y}px) rotate(${r}deg)`
      })
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        applyTransforms()
        ticking = false
      })
    }

    // Sync to current scroll position on mount (handles page reload mid-scroll)
    applyTransforms()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reduced])

  if (reduced) return null

  return (
    <div className={styles.layer} aria-hidden="true">
      {PILLS.map((c, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          className={styles.pill}
          style={{
            top:       `${c.top}%`,
            left:      `${c.left}%`,
            opacity:   c.op,
            filter:    c.blur ? `blur(${c.blur}px)` : undefined,
            transform: `translateY(0px) rotate(${c.rotBase}deg)`,
          }}
        >
          {c.shape === 'tablet'
            ? <TabletSvg  size={c.w} c1={c.c1} c2={c.c2} uid={i} />
            : <CapsuleSvg w={c.w}   h={c.h}   c1={c.c1} c2={c.c2} uid={i} />
          }
        </div>
      ))}
    </div>
  )
}
