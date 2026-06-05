import { useEffect, useRef } from 'react'
import styles from './FloatingPills.module.css'

// ── Config ────────────────────────────────────────────────────────────────────

const CFG = {
  count:      75,    // particle count
  connDist:   150,   // px — max distance at which two particles connect
  speed:      0.28,  // max px per frame (~17 px/s at 60 fps)
  dotOpacity: 0.30,  // particle fill opacity
  lineMax:    0.13,  // max line opacity (particles at distance 0)
  redRatio:   0.30,  // fraction of particles that use the red accent
  minR:       1.2,   // min dot radius px
  maxR:       2.4,   // max dot radius px
}

const CONN_SQ  = CFG.connDist * CFG.connDist  // avoid sqrt in hot loop
const RED      = '#e8455a'
const WHITE    = '#ffffff'

// ── Particle factory ──────────────────────────────────────────────────────────

function mkParticle(w, h) {
  const angle = Math.random() * Math.PI * 2
  const spd   = CFG.speed * (0.35 + Math.random() * 0.65)
  return {
    x:   Math.random() * w,
    y:   Math.random() * h,
    vx:  Math.cos(angle) * spd,
    vy:  Math.sin(angle) * spd,
    r:   CFG.minR + Math.random() * (CFG.maxR - CFG.minR),
    red: Math.random() < CFG.redRatio,
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
    let particles = []
    let rafId

    // ── Size canvas to fill viewport ────────────────────────────────────────

    function resize() {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    // ── Build initial particle set ──────────────────────────────────────────

    function init() {
      resize()
      particles = Array.from({ length: CFG.count }, () => mkParticle(w, h))
    }

    // ── Draw + move one frame ───────────────────────────────────────────────

    function tick() {
      ctx.clearRect(0, 0, w, h)

      // ── Connection lines ─────────────────────────────────────────────────
      ctx.lineWidth = 0.6

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b  = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 >= CONN_SQ) continue

          // Opacity falls off linearly from lineMax at d=0 to 0 at d=connDist
          ctx.globalAlpha = (1 - d2 / CONN_SQ) * CFG.lineMax
          // Tint the line red when either endpoint is a red particle
          ctx.strokeStyle = (a.red || b.red) ? RED : WHITE
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      // ── Dots ─────────────────────────────────────────────────────────────
      ctx.globalAlpha = CFG.dotOpacity

      for (const p of particles) {
        ctx.fillStyle = p.red ? RED : WHITE
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Restore default alpha for next frame
      ctx.globalAlpha = 1

      // ── Move particles (wrap at edges with a small margin) ────────────────
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -12)    p.x = w + 12
        if (p.x > w + 12) p.x = -12
        if (p.y < -12)    p.y = h + 12
        if (p.y > h + 12) p.y = -12
      }

      rafId = requestAnimationFrame(tick)
    }

    // ── Resize handler — keep canvas full-viewport ──────────────────────────

    function onResize() {
      resize()
      // Clamp any particles that are now outside the new bounds
      for (const p of particles) {
        if (p.x > w) p.x = Math.random() * w
        if (p.y > h) p.y = Math.random() * h
      }
    }

    init()
    tick()

    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  if (reduced) return null

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
