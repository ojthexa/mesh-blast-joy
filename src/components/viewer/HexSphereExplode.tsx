import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface HexSphereExplodeProps {
  radius?: number
  explodeStrength?: number
}

type Panel = {
  position: THREE.Vector3
  normal: THREE.Vector3
  isPentagon: boolean
}

const HexSphereExplode = ({
  radius = 1.3,
  explodeStrength = 0.18
}: HexSphereExplodeProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /* ===============================
     1️⃣ GEOMETRY PANEL
     =============================== */
  const hexGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.22, 0.22, 0.08, 6),
    []
  )

  const pentGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.22, 0.22, 0.08, 5),
    []
  )

  /* ===============================
     2️⃣ DATA TOPOLOGI BOLA SEPAK
     (Truncated Icosahedron)
     =============================== */
  const panels = useMemo<Panel[]>(() => {
    const result: Panel[] = []

    const phi = (1 + Math.sqrt(5)) / 2

    const rawVerts = [
      // pentagon centers
      [0, 1, 3], [0, -1, 3], [0, 1, -3], [0, -1, -3],
      [1, 3, 0], [-1, 3, 0], [1, -3, 0], [-1, -3, 0],
      [3, 0, 1], [-3, 0, 1], [3, 0, -1], [-3, 0, -1],

      // hexagon centers
      [1, 2, phi], [-1, 2, phi], [1, -2, phi], [-1, -2, phi],
      [1, 2, -phi], [-1, 2, -phi], [1, -2, -phi], [-1, -2, -phi],

      [2, phi, 1], [-2, phi, 1], [2, -phi, 1], [-2, -phi, 1],
      [2, phi, -1], [-2, phi, -1], [2, -phi, -1], [-2, -phi, -1],

      [phi, 1, 2], [-phi, 1, 2], [phi, -1, 2], [-phi, -1, 2],
      [phi, 1, -2], [-phi, 1, -2], [phi, -1, -2], [-phi, -1, -2]
    ]

    rawVerts.forEach((v, i) => {
      const vec = new THREE.Vector3(v[0], v[1], v[2]).normalize()
      result.push({
        position: vec.clone().multiplyScalar(radius),
        normal: vec.clone(),
        isPentagon: i < 12
      })
    })

    return result
  }, [radius])

  /* ===============================
     3️⃣ MICRO EXPLODE ANIMATION
     =============================== */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((mesh, i) => {
      const panel = panels[i]

      const target = hovered
        ? panel.position.clone().add(panel.normal.clone().multiplyScalar(explodeStrength))
        : panel.position

      mesh.position.lerp(target, delta * 6)

      const look = panel.position.clone().add(panel.normal)
      mesh.lookAt(look)
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
      {panels.map((panel, i) => (
        <mesh
          key={i}
          geometry={panel.isPentagon ? pentGeometry : hexGeometry}
          position={panel.position}
        >
          <meshStandardMaterial
            color={panel.isPentagon ? '#1e1e1e' : '#f2f2f2'}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  )
}

export default HexSphereExplode
