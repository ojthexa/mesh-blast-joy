import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  chunkCount?: number
}

const OrganicRockChunks = ({ chunkCount = 18 }: Props) => {
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
      const n = v.clone().normalize()
      v.addScaledVector(n, (Math.random() - 0.5) * 0.4)
      pos.setXYZ(i, v.x, v.y, v.z)
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  /* =========================
     2️⃣ CHUNKS
     ========================= */
  const chunks = useMemo(() => {
    return Array.from({ length: chunkCount }).map(() => {
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random(),
        Math.random() - 0.5
      ).normalize()

      return {
        direction: dir,
        offset: dir.clone().multiplyScalar(1.2 + Math.random() * 0.8),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        scale: 0.5 + Math.random() * 0.6
      }
    })
  }, [chunkCount])

  /* =========================
     3️⃣ ANIMATION
     ========================= */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((child, i) => {
      const c = chunks[i]
      const target = hovered ? c.offset : new THREE.Vector3()

      child.position.lerp(target, delta * 4)
      child.rotation.x += delta * 0.4
      child.rotation.y += delta * 0.3
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
          rotation={c.rotation}
        >
          <meshStandardMaterial
            color="#8f8870"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

export default OrganicRockChunks
