import styles from './FloatingPills.module.css'

// ── SVG building blocks ──────────────────────────────────────────────────────

function CapsuleSvg({ w, h, c1, c2, uid }) {
  const r = h / 2
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`fp-cg-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor={c1} />
          <stop offset="50%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`fp-ch-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} rx={r} fill={`url(#fp-cg-${uid})`} />
      <line
        x1={w / 2} y1={r * 0.25}
        x2={w / 2} y2={h - r * 0.25}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <rect
        x={r * 1.2}
        y={h * 0.11}
        width={Math.max(0, w - r * 2.4)}
        height={h * 0.28}
        rx={h * 0.12}
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
        <radialGradient id={`fp-tg-${uid}`} cx="38%" cy="32%" r="68%" gradientUnits="userSpaceOnUse"
          x1="0" y1="0" x2={s} y2={s}>
          <stop offset="0%"   stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </radialGradient>
        <radialGradient id={`fp-th-${uid}`} cx="50%" cy="28%" r="52%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#fp-tg-${uid})`} />
      <line
        x1={s * 0.20} y1={cy}
        x2={s * 0.80} y2={cy}
        stroke="rgba(0,0,0,0.30)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={r} fill={`url(#fp-th-${uid})`} />
    </svg>
  )
}

// ── Pill config ───────────────────────────────────────────────────────────────
// drift: 0–3 maps to driftA–driftD keyframe classes
// dur: animation duration in seconds
// delay: negative = start mid-cycle so pills are already in flight on load
// op: brightness ceiling — keyframe fades 0→1→0 against this value

const D1 = '#6B0F1A'   // deep crimson
const D2 = '#3D0009'   // near-black
const M1 = '#8B1A2A'   // maroon
const M2 = '#4A0010'   // dark maroon
const C1 = '#900A20'   // bright crimson
const C2 = '#580A16'   // dark crimson

const DRIFT = ['driftA', 'driftB', 'driftC', 'driftD']

const PILLS = [
  // ── capsules ────────────────────────────────────────────────
  { left:  4, w:  88, h: 30, shape: 'capsule', c1: D1, c2: D2, drift: 0, dur: 22, delay:   0, op: 0.10, blur: 0 },
  { left: 14, w: 128, h: 44, shape: 'capsule', c1: M1, c2: M2, drift: 1, dur: 18, delay:  -5, op: 0.07, blur: 1 },
  { left: 22, w:  60, h: 22, shape: 'capsule', c1: C1, c2: C2, drift: 2, dur: 26, delay: -10, op: 0.08, blur: 0 },
  { left: 34, w: 108, h: 38, shape: 'capsule', c1: D1, c2: D2, drift: 3, dur: 20, delay:  -3, op: 0.09, blur: 0 },
  { left: 44, w:  70, h: 26, shape: 'capsule', c1: M1, c2: M2, drift: 0, dur: 16, delay:  -8, op: 0.06, blur: 2 },
  { left: 54, w:  98, h: 34, shape: 'capsule', c1: C1, c2: C2, drift: 1, dur: 24, delay: -15, op: 0.10, blur: 0 },
  { left: 64, w:  78, h: 28, shape: 'capsule', c1: D1, c2: D2, drift: 2, dur: 19, delay:  -2, op: 0.07, blur: 1 },
  { left: 74, w: 118, h: 42, shape: 'capsule', c1: M1, c2: M2, drift: 3, dur: 27, delay: -12, op: 0.08, blur: 0 },
  { left: 84, w:  52, h: 20, shape: 'capsule', c1: C1, c2: C2, drift: 0, dur: 21, delay:  -6, op: 0.09, blur: 0 },
  { left: 93, w:  92, h: 32, shape: 'capsule', c1: D1, c2: D2, drift: 1, dur: 17, delay:  -9, op: 0.06, blur: 2 },
  // ── tablets ─────────────────────────────────────────────────
  { left:  9, w:  38, h: 38, shape: 'tablet',  c1: M1, c2: M2, drift: 2, dur: 25, delay:  -4, op: 0.07, blur: 1 },
  { left: 28, w:  50, h: 50, shape: 'tablet',  c1: C1, c2: C2, drift: 3, dur: 20, delay: -11, op: 0.05, blur: 2 },
  { left: 39, w:  30, h: 30, shape: 'tablet',  c1: D1, c2: D2, drift: 0, dur: 29, delay:  -7, op: 0.08, blur: 0 },
  { left: 49, w:  44, h: 44, shape: 'tablet',  c1: M1, c2: M2, drift: 1, dur: 15, delay: -13, op: 0.06, blur: 1 },
  { left: 61, w:  36, h: 36, shape: 'tablet',  c1: C1, c2: C2, drift: 2, dur: 23, delay:  -1, op: 0.09, blur: 0 },
  { left: 77, w:  54, h: 54, shape: 'tablet',  c1: D1, c2: D2, drift: 3, dur: 18, delay: -16, op: 0.05, blur: 2 },
  { left: 87, w:  32, h: 32, shape: 'tablet',  c1: M1, c2: M2, drift: 0, dur: 28, delay:  -5, op: 0.07, blur: 0 },
  { left: 97, w:  42, h: 42, shape: 'tablet',  c1: C1, c2: C2, drift: 1, dur: 14, delay:  -9, op: 0.06, blur: 1 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingPills() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) return null

  return (
    <div className={styles.layer} aria-hidden="true">
      {PILLS.map((c, i) => (
        // Outer wrapper: sets per-pill brightness ceiling + blur
        <div
          key={i}
          className={styles.pillWrap}
          style={{
            left:    `${c.left}%`,
            opacity: c.op,
            filter:  c.blur ? `blur(${c.blur}px)` : undefined,
          }}
        >
          {/* Inner animated element: keyframe floats it up and fades 0→1→0 */}
          <div
            className={`${styles.pillAnim} ${styles[DRIFT[c.drift]]}`}
            style={{
              animationDuration: `${c.dur}s`,
              animationDelay:    `${c.delay}s`,
            }}
          >
            {c.shape === 'tablet'
              ? <TabletSvg  size={c.w} c1={c.c1} c2={c.c2} uid={i} />
              : <CapsuleSvg w={c.w}   h={c.h}   c1={c.c1} c2={c.c2} uid={i} />
            }
          </div>
        </div>
      ))}
    </div>
  )
}
