import { useEffect, useRef } from 'react'
import styles from './FloatingPills.module.css'

// ── Config ────────────────────────────────────────────────────────────────────

const COUNT   = 18
const OPACITY = 0.40

const PALETTE = [
  ['#7A0818', '#3D0009'],
  ['#8B1A2A', '#4A0010'],
  ['#900A20', '#580A16'],
  ['#6B0F1A', '#3A0008'],
  ['#A01828', '#5D0B15'],
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function rand(a, b) { return a + Math.random() * (b - a) }
function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)] }

// Portable rounded-rect path (no ctx.roundRect dependency)
function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}

// ── Pill factory ──────────────────────────────────────────────────────────────

function mkPill(w, h) {
  const isTab  = Math.random() < 0.28          // ~28 % circular tablets
  const colors = pick(PALETTE)
  const angle  = Math.random() * Math.PI * 2
  const pw     = rand(38, 130)
  const ph     = isTab ? pw : pw * rand(0.28, 0.40)   // capsule h ≈ w/3

  return {
    x:    rand(0, w),
    y:    rand(0, h),
    vx:   Math.cos(angle) * rand(0.10, 0.28),
    vy:   Math.sin(angle) * rand(0.10, 0.28),
    w:    pw,
    h:    ph,
    rot:  rand(0, Math.PI * 2),
    rotV: (Math.random() < 0.5 ? 1 : -1) * rand(0.0008, 0.0035),
    c1:   colors[0],
    c2:   colors[1],
    tab:  isTab,
  }
}

// ── Shape drawers (ctx already translated + rotated to pill centre) ───────────

function drawCapsule(ctx, w, h, c1, c2) {
  const r = h / 2
  ctx.save()
  rrPath(ctx, -w / 2, -h / 2, w, h, r)
  ctx.clip()

  ctx.fillStyle = c1
  ctx.fillRect(-w / 2, -h / 2, w / 2, h)   // left half
  ctx.fillStyle = c2
  ctx.fillRect(0,      -h / 2, w / 2, h)   // right half

  ctx.strokeStyle = 'rgba(0,0,0,0.20)'
  ctx.lineWidth   = 0.8
  ctx.beginPath()
  ctx.moveTo(0, -h / 2 + r * 0.4)
  ctx.lineTo(0,  h / 2 - r * 0.4)
  ctx.stroke()

  ctx.restore()
}

function drawTablet(ctx, r, c1, c2) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.clip()

  ctx.fillStyle = c1
  ctx.fillRect(-r, -r, r, r * 2)   // left half
  ctx.fillStyle = c2
  ctx.fillRect(0,  -r, r, r * 2)   // right half

  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth   = 0.8
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.65)
  ctx.lineTo(0,  r * 0.65)
  ctx.stroke()

  ctx.restore()
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

    let w, h, pills, rafId

    function resize() {
      w = canvas.width  = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    function init() {
      resize()
      pills = Array.from({ length: COUNT }, () => mkPill(w, h))
    }

    function tick() {
      ctx.clearRect(0, 0, w, h)
      ctx.globalAlpha = OPACITY

      for (const p of pills) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)

        p.tab
          ? drawTablet(ctx, p.w / 2, p.c1, p.c2)
          : drawCapsule(ctx, p.w, p.h, p.c1, p.c2)

        ctx.restore()

        p.x   += p.vx
        p.y   += p.vy
        p.rot += p.rotV

        const m = Math.max(p.w, p.h) + 20
        if (p.x < -m)     p.x = w + m
        if (p.x >  w + m) p.x = -m
        if (p.y < -m)     p.y = h + m
        if (p.y >  h + m) p.y = -m
      }

      ctx.globalAlpha = 1
      rafId = requestAnimationFrame(tick)
    }

    function onResize() {
      resize()
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
