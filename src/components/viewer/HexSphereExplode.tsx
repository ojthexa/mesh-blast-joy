import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HexSphereExplodeProps {
  radius?: number
  count?: number
  explodeStrength?: number
}

const HexSphereExplode = ({
  radius = 1.3,
  count = 90,
  explodeStrength = 0.25
}: HexSphereExplodeProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /* ===============================
     1️⃣ HEXAGON GEOMETRY
     =============================== */
  const hexGeometry = useMemo(() => {
    // Cylinder dengan 6 sisi → hexagon
    return new THREE.CylinderGeometry(0.14, 0.14, 0.06, 6)
  }, [])

  /* ===============================
     2️⃣ DISTRIBUSI HEX DI BOLA
     (Fibonacci Sphere)
     =============================== */
  const tiles = useMemo(() => {
    const data: {
      base: THREE.Vector3
      normal: THREE.Vector3
      explode: THREE.Vector3
    }[] = []

    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = goldenAngle * i

      const x = Math.cos(theta) * r
      const z = Math.sin(theta) * r

      const normal = new THREE.Vector3(x, y, z).normalize()
      const base = normal.clone().multiplyScalar(radius)
      const explode = normal.clone().multiplyScalar(explodeStrength)

      data.push({ base, normal, explode })
    }

    return data
  }, [count, radius, explodeStrength])

  /* ===============================
     3️⃣ ANIMASI MICRO EXPLODE
     =============================== */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((mesh, i) => {
      const tile = tiles[i]

      const targetPos = hovered
        ? tile.base.clone().add(tile.explode)
        : tile.base

      mesh.position.lerp(targetPos, delta * 6)

      // Arahkan hexagon ke luar bola
      const lookTarget = tile.base.clone().add(tile.normal)
      mesh.lookAt(lookTarget)
    })
  })

  /* ===============================
     4️⃣ RENDER
     =============================== */
  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {tiles.map((tile, i) => (
        <mesh
          key={i}
          geometry={hexGeometry}
          position={tile.base}
        >
          <meshStandardMaterial
            color="#cfc8b8"
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  )
}

export default HexSphereExplode
