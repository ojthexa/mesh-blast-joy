import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils'

interface HexSphereExplodeProps {
  radius?: number
  explodeStrength?: number
}

const HexSphereExplode = ({
  radius = 1.2,
  explodeStrength = 0.15
}: HexSphereExplodeProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /* ===============================
     1️⃣ SOLID BOLA SEPAK (BASE)
     =============================== */
  const panels = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(radius, 0)

    // Truncate → mirip bola sepak
    base.computeVertexNormals()

    const geometries: {
      geom: THREE.BufferGeometry
      normal: THREE.Vector3
    }[] = []

    const pos = base.attributes.position
    const temp = new THREE.Vector3()

    for (let i = 0; i < pos.count; i += 3) {
      const face = new THREE.BufferGeometry()
      const verts = []

      for (let j = 0; j < 3; j++) {
        temp.fromBufferAttribute(pos, i + j)
        verts.push(temp.clone())
      }

      face.setFromPoints(verts)
      face.computeVertexNormals()

      const normal = verts[0].clone().add(verts[1]).add(verts[2]).normalize()

      geometries.push({
        geom: face,
        normal
      })
    }

    return geometries
  }, [radius])

  /* ===============================
     2️⃣ MICRO EXPLODE
     =============================== */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((mesh, i) => {
      const panel = panels[i]
      if (!panel) return

      const offset = hovered
        ? panel.normal.clone().multiplyScalar(explodeStrength)
        : new THREE.Vector3()

      mesh.position.lerp(offset, delta * 6)
    })
  })

  /* ===============================
     3️⃣ RENDER
     =============================== */
  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {panels.map((p, i) => (
        <mesh key={i} geometry={p.geom}>
          <meshStandardMaterial
            color="#eaeaea"
            roughness={0.6}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

export default HexSphereExplode
