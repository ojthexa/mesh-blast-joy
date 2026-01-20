import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

interface Props {
  url: string
  count?: number
  hexSize?: number
  explodeStrength?: number
}

const HexParticleFromGLB = ({
  url,
  count = 300,
  hexSize = 0.035,
  explodeStrength = 0.12
}: Props) => {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  /* ===============================
     HEX GEOMETRY
     =============================== */
  const hexGeometry = useMemo(
    () => new THREE.CylinderGeometry(hexSize, hexSize, hexSize * 0.5, 6),
    [hexSize]
  )

  /* ===============================
     SAMPLE SURFACE → HEX PARTICLES
     =============================== */
  const particles = useMemo(() => {
    const data: {
      base: THREE.Vector3
      normal: THREE.Vector3
    }[] = []

    scene.updateMatrixWorld(true)

    scene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return

      const sampler = new MeshSurfaceSampler(obj).build()
      const pos = new THREE.Vector3()
      const normal = new THREE.Vector3()

      for (let i = 0; i < count; i++) {
        sampler.sample(pos, normal)
        data.push({
          base: pos.clone(),
          normal: normal.clone()
        })
      }
    })

    return data
  }, [scene, count])

  /* ===============================
     ANIMATION
     =============================== */
  useFrame((_, delta) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((mesh, i) => {
      const p = particles[i]
      if (!p) return

      const target = hovered
        ? p.base.clone().add(p.normal.clone().multiplyScalar(explodeStrength))
        : p.base

      mesh.position.lerp(target, delta * 6)
      mesh.lookAt(p.base.clone().add(p.normal))
    })
  })

  /* ===============================
     RENDER
     =============================== */
  return (
    <group
      ref={groupRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {particles.map((p, i) => (
        <mesh key={i} geometry={hexGeometry} position={p.base}>
          <meshStandardMaterial
            color="#e6e2d8"
            roughness={0.8}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  )
}

export default HexParticleFromGLB
