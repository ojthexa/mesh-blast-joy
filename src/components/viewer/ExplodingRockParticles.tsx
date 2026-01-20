import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three-stdlib'

interface Props {
  isExploded: boolean
  particleCount: number
}

const ExplodingRockParticles = ({ isExploded, particleCount }: Props) => {
  const pointsRef = useRef<THREE.Points>(null)

  // === Rock geometry (icosahedron = batu alami) ===
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.2, 3)
    geo.computeVertexNormals()
    return geo
  }, [])

  // === Sample points on surface ===
  const { positions, velocities } = useMemo(() => {
    const sampler = new MeshSurfaceSampler(
      new THREE.Mesh(geometry)
    ).build()

    const pos = new Float32Array(particleCount * 3)
    const vel = new Float32Array(particleCount * 3)

    const tempPos = new THREE.Vector3()
    const dir = new THREE.Vector3()

    for (let i = 0; i < particleCount; i++) {
      sampler.sample(tempPos)

      pos.set([tempPos.x, tempPos.y, tempPos.z], i * 3)

      dir.copy(tempPos).normalize().addScalar(Math.random() * 0.3)

      vel.set([
        dir.x * (2 + Math.random() * 4),
        dir.y * (2 + Math.random() * 4),
        dir.z * (2 + Math.random() * 4)
      ], i * 3)
    }

    return { positions: pos, velocities: vel }
  }, [geometry, particleCount])

  // === Geometry buffer ===
  const bufferGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    return geo
  }, [positions, velocities])

  // === Animate explosion ===
  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const pos = bufferGeometry.attributes.position as THREE.BufferAttribute
    const vel = bufferGeometry.attributes.velocity as THREE.BufferAttribute

    for (let i = 0; i < pos.count; i++) {
      if (isExploded) {
        pos.array[i * 3]     += vel.array[i * 3] * delta
        pos.array[i * 3 + 1] += vel.array[i * 3 + 1] * delta
        pos.array[i * 3 + 2] += vel.array[i * 3 + 2] * delta
      } else {
        // pull back to origin
        pos.array[i * 3]     *= 0.9
        pos.array[i * 3 + 1] *= 0.9
        pos.array[i * 3 + 2] *= 0.9
      }
    }

    pos.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={bufferGeometry}>
      <pointsMaterial
        color={new THREE.Color('#c2b59b')}
        size={2}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={1}
      />
    </points>
  )
}

export default ExplodingRockParticles
