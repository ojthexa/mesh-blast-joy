import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  chunkCount?: number
}

const OrganicRockChunks = ({ chunkCount = 12 }: Props) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /* =========================
     1️⃣ BASE ROCK GEOMETRY
     ========================= */
  const rockGeometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 3)
    const pos = geo.attributes.position as THREE.BufferAttribute

    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i)
      v.addScaledVector(v.normalize(), (Math.random() - 0.5) * 0.25)
      pos.setXYZ(i, v.x, v.y, v.z)
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  /* =========================
     2️⃣ CHUNKS DATA
     ========================= */
  const chunks = useMemo(() => {
    return Array.from({ length: chunkCount }).map(() => {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() * 0.6,
        Math.random() - 0.5
      ).normalize()

      return {
        basePosition: new THREE.Vector3(), // pusat
        explodeOffset: dir.multiplyScalar(0.25 + Math.random() * 0.15),
        rotation: new THREE.Euler(
          Math.random() * 0.4,
          Math.random() * 0.4,
          Math.random() * 0.4
        ),
        scale: 0.8 + Math.random() * 0.3
      }
    })
  }, [chunkCount])

  /* =========================
     3️⃣ ANIMATION (MICRO EXPLODE)
     ========================= */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((child, i) => {
      const c = chunks[i]
      const target = hovered ? c.explodeOffset : c.basePosition

      child.position.lerp(target, delta * 6)
      child.rotation.x += c.rotation.x * delta
      child.rotation.y += c.rotation.y * delta
      child.rotation.z += c.rotation.z * delta
    })
  })

  /* =========================
     4️⃣ RENDER
     ========================= */
  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {chunks.map((c, i) => (
        <mesh
          key={i}
          geometry={rockGeometry}
          scale={c.scale}
        >
          <meshStandardMaterial
            color="#8c846a"
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  )
}

export default OrganicRockChunks
