import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CubePiece {
  id: number;
  position: THREE.Vector3;
  targetPosition: THREE.Vector3;
  originalPosition: THREE.Vector3;
  rotation: THREE.Euler;
  targetRotation: THREE.Euler;
  originalRotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface ExplodingCubeProps {
  isExploded: boolean;
  pieceCount?: number;
}

const ExplodingCube = ({ isExploded, pieceCount = 27 }: ExplodingCubeProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  const pieces = useMemo(() => {
    const piecesArray: CubePiece[] = [];
    const gridSize = Math.ceil(Math.cbrt(pieceCount));
    const pieceSize = 2 / gridSize;
    const offset = (gridSize - 1) * pieceSize / 2;

    let id = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          if (id >= pieceCount) break;
          
          const originalPos = new THREE.Vector3(
            x * pieceSize - offset,
            y * pieceSize - offset,
            z * pieceSize - offset
          );

          // Random explosion target position
          const explosionDirection = originalPos.clone().normalize();
          const randomOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 8
          );
          const targetPos = explosionDirection.multiplyScalar(3 + Math.random() * 4).add(randomOffset);

          piecesArray.push({
            id: id++,
            position: originalPos.clone(),
            targetPosition: targetPos,
            originalPosition: originalPos.clone(),
            rotation: new THREE.Euler(0, 0, 0),
            targetRotation: new THREE.Euler(
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4
            ),
            originalRotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(pieceSize * 0.95, pieceSize * 0.95, pieceSize * 0.95),
          });
        }
      }
    }
    return piecesArray;
  }, [pieceCount]);

  useEffect(() => {
    setAnimationProgress(0);
  }, [isExploded]);

  useFrame((_, delta) => {
    const targetProgress = isExploded ? 1 : 0;
    const speed = 2;
    
    if (Math.abs(animationProgress - targetProgress) > 0.001) {
      const newProgress = THREE.MathUtils.lerp(
        animationProgress,
        targetProgress,
        1 - Math.pow(0.001, delta * speed)
      );
      setAnimationProgress(newProgress);
    }
  });

  // Easing function for smoother animation
  const easeOutBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const easedProgress = easeOutBack(animationProgress);

  return (
    <group ref={groupRef}>
      {pieces.map((piece) => {
        const currentPos = new THREE.Vector3().lerpVectors(
          piece.originalPosition,
          piece.targetPosition,
          easedProgress
        );
        
        const currentRot = new THREE.Euler(
          THREE.MathUtils.lerp(piece.originalRotation.x, piece.targetRotation.x, easedProgress),
          THREE.MathUtils.lerp(piece.originalRotation.y, piece.targetRotation.y, easedProgress),
          THREE.MathUtils.lerp(piece.originalRotation.z, piece.targetRotation.z, easedProgress)
        );

        return (
          <mesh
            key={piece.id}
            position={currentPos}
            rotation={currentRot}
            scale={piece.scale}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={`hsl(${200 + piece.id * 5}, 70%, 50%)`}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default ExplodingCube;
