import { useEffect, useRef } from 'react'
import styles from './FloatingPills.module.css'

// ── Layer definitions ─────────────────────────────────────────────────────────
//   blur     : CSS px blur applied to every pill in this layer
//   opacity  : globalAlpha for the layer
//   wRange   : [min, max] pill width  (capsule) / diameter (tablet)  in px
//   hRange   : [min, max] pill height (capsule only)                 in px
//   speed    : max drift velocity, px/frame
//   rotSpeed : max |rotational velocity|, rad/frame
//   parallax : fraction of mouse-offset applied as opposite translation

const LAYERS = [
  { count: 12, blur: 4, opacity: 0.20, wRange: [18, 44],  hRange: [7,  16], speed: 0.14, rotSpeed: 0.0020, parallax: 0.012 },
  { count:  9, blur: 1, opacity: 0.35, wRange: [44, 82],  hRange: [15, 28], speed: 0.26, rotSpeed: 0.0040, parallax: 0.028 },
  { count:  5, blur: 0, opacity: 0.50, wRange: [82, 132], hRange: [28, 44], speed: 0.40, rotSpeed: 0.0060, parallax: 0.055 },
]

// ── Colour palette — dark crimson / maroon ────────────────────────────────────
//   Each entry is [c1 (lighter half), c2 (darker half)]

const PALETTE = [
  ['#7A0818', '#3D0009'],
  ['#8B1A2A', '#4A0010'],
  ['#900A20', '#580A16'],
  ['#6B0F1A', '#3A0008'],
  ['#A01828', '#5D0B15'],
]

// 30 % of pills are round tablets; the rest are capsules
const TABLET_RATIO = 0.30

// Mouse-smoothing lerp factor — higher = snappier
const MOUSE_LERP = 0.07

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand(a, b) { return a + Math.random() * (b - a) }
function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)] }

// Portable rounded-rect path — works without ctx.roundRect (older Safari)
function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}

// ── Particle factory ──────────────────────────────────────────────────────────

function mkPill(li, w, h) {
  const cfg    = LAYERS[li]
  const isTab  = Math.random() < TABLET_RATIO
  const colors = pick(PALETTE)
  const angle  = Math.random() * Math.PI * 2
  const spd    = cfg.speed * rand(0.35, 1.0)
  const pw     = rand(...cfg.wRange)
  const ph     = isTab ? pw : rand(...cfg.hRange)

  return {
    x:    rand(-pw, w + pw),     // spread across full viewport incl. off-screen
    y:    rand(-ph, h + ph),
    vx:   Math.cos(angle) * spd,
    vy:   Math.sin(angle) * spd,
    w:    pw,
    h:    ph,
    rot:  rand(0, Math.PI * 2),
    rotV: (Math.random() < 0.5 ? 1 : -1) * rand(cfg.rotSpeed * 0.3, cfg.rotSpeed),
    c1:   colors[0],
    c2:   colors[1],
    tab:  isTab,
  }
}

// ── Shape drawers (called with ctx already translated + rotated to pill centre) ─

function drawCapsule(ctx, w, h, c1, c2, detailed) {
  const r = h / 2

  if (detailed) {
    // Two-tone split with a vertical seam — front layer only
    ctx.save()
    rrPath(ctx, -w / 2, -h / 2, w, h, r)
    ctx.clip()

    ctx.fillStyle = c1
    ctx.fillRect(-w / 2, -h / 2, w / 2, h)  // left half
    ctx.fillStyle = c2
    ctx.fillRect(0,      -h / 2, w / 2, h)  // right half

    // Seam line
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'
    ctx.lineWidth   = 0.9
    ctx.beginPath()
    ctx.moveTo(0, -h / 2 + r * 0.4)
    ctx.lineTo(0,  h / 2 - r * 0.4)
    ctx.stroke()

    // Subtle top highlight
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.38)

    ctx.restore()
  } else {
    // Solid fill — detail invisible through blur
    rrPath(ctx, -w / 2, -h / 2, w, h, r)
    ctx.fillStyle = c1
    ctx.fill()
  }
}

function drawTablet(ctx, w, c1, c2, detailed) {
  const r = w / 2  // w == h for tablets

  if (detailed) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.clip()

    ctx.fillStyle = c1
    ctx.fillRect(-r, -r, r, r * 2)  // left half
    ctx.fillStyle = c2
    ctx.fillRect(0,  -r, r, r * 2)  // right half

    // Vertical score line
    ctx.strokeStyle = 'rgba(0,0,0,0.20)'
    ctx.lineWidth   = 0.9
    ctx.beginPath()
    ctx.moveTo(0, -r * 0.65)
    ctx.lineTo(0,  r * 0.65)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  } else {
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fillStyle = c1
    ctx.fill()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function FloatingPills() {
  const canvasRef = useRef(null)

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (reduced) return

    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    let w, h
    let layers = []            // layers[li] = array of pill objects
    let rafId

    // Smoothed mouse offset from viewport centre
    let mxTarget = 0, myTarget = 0
    let mx = 0, my = 0

    // ── Setup ───────────────────────────────────────────────────────────────

    function resize() {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function init() {
      resize()
      layers = LAYERS.map((_, li) =>
        Array.from({ length: LAYERS[li].count }, () => mkPill(li, w, h))
      )
    }

    // ── Event handlers ───────────────────────────────────────────────────────

    function onMouse(e) {
      mxTarget = e.clientX - w / 2
      myTarget = e.clientY - h / 2
    }

    function onTouch(e) {
      const t = e.touches[0]
      if (t) { mxTarget = t.clientX - w / 2; myTarget = t.clientY - h / 2 }
    }

    function onResize() {
      resize()
    }

    // ── Render loop ──────────────────────────────────────────────────────────

    function tick() {
      ctx.clearRect(0, 0, w, h)

      // Lerp mouse toward target
      mx += (mxTarget - mx) * MOUSE_LERP
      my += (myTarget - my) * MOUSE_LERP

      for (let li = 0; li < LAYERS.length; li++) {
        const cfg      = LAYERS[li]
        const detailed = (li === 2)            // two-tone only on front layer
        const ox       = -mx * cfg.parallax   // opposite direction → depth
        const oy       = -my * cfg.parallax

        ctx.save()
        if (cfg.blur > 0) ctx.filter  = `blur(${cfg.blur}px)`
        ctx.globalAlpha = cfg.opacity

        for (const p of layers[li]) {
          // ── Draw ────────────────────────────────────────────────────────
          ctx.save()
          ctx.translate(p.x + ox, p.y + oy)
          ctx.rotate(p.rot)

          if (p.tab) {
            drawTablet(ctx, p.w, p.c1, p.c2, detailed)
          } else {
            drawCapsule(ctx, p.w, p.h, p.c1, p.c2, detailed)
          }

          ctx.restore()

          // ── Move ─────────────────────────────────────────────────────────
          p.x   += p.vx
          p.y   += p.vy
          p.rot += p.rotV

          const margin = Math.max(p.w, p.h) + 20
          if (p.x < -(margin))  p.x = w + margin
          if (p.x >  w + margin) p.x = -margin
          if (p.y < -(margin))  p.y = h + margin
          if (p.y >  h + margin) p.y = -margin
        }

        ctx.restore()   // restores filter + globalAlpha for this layer
      }

      rafId = requestAnimationFrame(tick)
    }

    init()
    tick()

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('resize',    onResize, { passive: true })

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('resize',    onResize)
    }
  }, [reduced])

  if (reduced) return null

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
