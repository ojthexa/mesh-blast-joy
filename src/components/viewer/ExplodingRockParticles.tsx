import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three-stdlib'

interface Props {
  particleCount: number
}

const ExplodingRockParticles = ({ particleCount }: Props) => {
  const pointsRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)

  /* ===============================
     1️⃣ GEOMETRY BATU TIDAK BERATURAN
     =============================== */
  const rockGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 4)
    const pos = geo.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i)
      const noise = 0.25 * Math.sin(v.x * 3 + v.y * 4 + v.z * 5)
      v.addScaledVector(v.normalize(), noise)
      pos.setXYZ(i, v.x, v.y, v.z)
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  /* ===============================
     2️⃣ SAMPLING PARTIKEL
     =============================== */
  const { positions, velocities, basePositions } = useMemo(() => {
    const sampler = new MeshSurfaceSampler(
      new THREE.Mesh(rockGeometry)
    ).build()

    const pos = new Float32Array(particleCount * 3)
    const base = new Float32Array(particleCount * 3)
    const vel = new Float32Array(particleCount * 3)

    const p = new THREE.Vector3()
    const dir = new THREE.Vector3()

    for (let i = 0; i < particleCount; i++) {
      sampler.sample(p)

      pos.set([p.x, p.y, p.z], i * 3)
      base.set([p.x, p.y, p.z], i * 3)

      dir.copy(p).normalize().addScalar(Math.random() * 0.4)

      vel.set([
        dir.x * (2 + Math.random() * 3),
        dir.y * (2 + Math.random() * 4),
        dir.z * (2 + Math.random() * 3)
      ], i * 3)
    }

    return { positions: pos, basePositions: base, velocities: vel }
  }, [rockGeometry, particleCount])

  /* ===============================
     3️⃣ BUFFER GEOMETRY
     =============================== */
  const bufferGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('basePosition', new THREE.BufferAttribute(basePositions, 3))
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    return geo
  }, [positions, basePositions, velocities])

  /* ===============================
     4️⃣ ANIMASI HOVER → EXPLODE
     =============================== */
  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const pos = bufferGeometry.attributes.position as THREE.BufferAttribute
    const base = bufferGeometry.attributes.basePosition as THREE.BufferAttribute
    const vel = bufferGeometry.attributes.velocity as THREE.BufferAttribute

    const strength = hovered ? 1.2 : 0.15

    for (let i = 0; i < pos.count; i++) {
      if (hovered) {
        pos.array[i * 3]     += vel.array[i * 3] * delta * strength
        pos.array[i * 3 + 1] += vel.array[i * 3 + 1] * delta * strength
        pos.array[i * 3 + 2] += vel.array[i * 3 + 2] * delta * strength
      } else {
        pos.array[i * 3]     += (base.array[i * 3]     - pos.array[i * 3])     * delta * 4
        pos.array[i * 3 + 1] += (base.array[i * 3 + 1] - pos.array[i * 3 + 1]) * delta * 4
        pos.array[i * 3 + 2] += (base.array[i * 3 + 2] - pos.array[i * 3 + 2]) * delta * 4
      }
    }

    pos.needsUpdate = true
  })

  /* ===============================
     5️⃣ RENDER
     =============================== */
  return (
    <points
      ref={pointsRef}
      geometry={bufferGeometry}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <pointsMaterial
        size={2.2}
        color="#9e947d"
        sizeAttenuation
        transparent
        depthWrite={false}
      />
    </points>
  )
}

export default ExplodingRockParticles
