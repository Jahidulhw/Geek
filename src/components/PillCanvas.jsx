import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const PALETTE = [
  { words: ['ibuprofen','acetaminophen','aspirin','naproxen','tramadol','tylenol','advil','aleve'], hex: '#FF4455' },
  { words: ['adderall','zoloft','xanax','lexapro','prozac','wellbutrin','vyvanse','klonopin','sertraline','fluoxetine','escitalopram','amphetamine','methylphenidate','ritalin'], hex: '#4488FF' },
  { words: ['melatonin','magnesium','vitamin','zinc','benadryl','diphenhydramine'], hex: '#FFD44A' },
  { words: ['ozempic','metformin','lisinopril','atorvastatin','levothyroxine','omeprazole','semaglutide'], hex: '#44CC88' },
  { words: ['amoxicillin','azithromycin','doxycycline','tamiflu','oseltamivir','ciprofloxacin'], hex: '#FF8844' },
]
const FALLBACK_HEX = '#AA88FF'

function pillColor(brand, generic) {
  const hay = `${brand} ${generic}`.toLowerCase()
  for (const { words, hex } of PALETTE) {
    if (words.some(w => hay.includes(w))) return hex
  }
  return FALLBACK_HEX
}

export default function PillCanvas({ drugName = '', genericName = '', size = 120 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const hex = pillColor(drugName, genericName)
    const W = size, H = size

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100)
    camera.position.z = 4.5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(3, 4, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(hex, 0.6)
    fill.position.set(-3, -2, 2)
    scene.add(fill)

    // Capsule body with two-tone vertex colors (top half brighter)
    const geo = new THREE.CapsuleGeometry(0.36, 0.7, 12, 28)
    const pos = geo.attributes.position
    const cols = new Float32Array(pos.count * 3)
    const topC = new THREE.Color(hex)
    const botC = new THREE.Color(hex).multiplyScalar(0.52)
    for (let i = 0; i < pos.count; i++) {
      const c = pos.getY(i) >= 0 ? topC : botC
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3))

    const mat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 110,
      specular: new THREE.Color(0xffffff),
    })
    const pill = new THREE.Mesh(geo, mat)

    // Seam ring at capsule equator
    const seamGeo = new THREE.TorusGeometry(0.36, 0.016, 8, 48)
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0.3, transparent: true })
    const seam = new THREE.Mesh(seamGeo, seamMat)
    seam.rotation.x = Math.PI / 2   // align to XZ plane (capsule equator)

    const group = new THREE.Group()
    group.add(pill)
    group.add(seam)
    group.rotation.z = Math.PI / 5  // 36° tilt for a natural resting angle
    scene.add(group)

    let frame
    const tick = () => {
      frame = requestAnimationFrame(tick)
      group.rotation.y += 0.011
      group.rotation.x += 0.0025
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      geo.dispose(); mat.dispose()
      seamGeo.dispose(); seamMat.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [drugName, genericName, size])

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  )
}
