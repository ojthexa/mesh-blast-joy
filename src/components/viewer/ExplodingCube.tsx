import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CubePiece {
  id: number;
  targetPosition: THREE.Vector3;
  originalPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  originalRotation: THREE.Euler;
  scale: THREE.Vector3;
  color: string;
}

interface ExplodingCubeProps {
  isExploded: boolean;
  pieceCount?: number;
}

interface PieceMeshProps {
  piece: CubePiece;
  isGlobalExploded: boolean;
}

const PieceMesh = ({ piece, isGlobalExploded }: PieceMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  // Piece explodes if globally exploded OR if hovered
  const shouldExplode = isGlobalExploded || isHovered;

  useFrame((_, delta) => {
    const targetProgress = shouldExplode ? 1 : 0;
    const speed = 3;
    
    if (Math.abs(animationProgress - targetProgress) > 0.001) {
      const newProgress = THREE.MathUtils.lerp(
        animationProgress,
        targetProgress,
        1 - Math.pow(0.001, delta * speed)
      );
      setAnimationProgress(newProgress);
    }

    if (meshRef.current) {
      const easedProgress = easeOutBack(animationProgress);
      
      // Update position
      meshRef.current.position.lerpVectors(
        piece.originalPosition,
        piece.targetPosition,
        easedProgress
      );
      
      // Update rotation
      meshRef.current.rotation.set(
        THREE.MathUtils.lerp(piece.originalRotation.x, piece.targetRotation.x, easedProgress),
        THREE.MathUtils.lerp(piece.originalRotation.y, piece.targetRotation.y, easedProgress),
        THREE.MathUtils.lerp(piece.originalRotation.z, piece.targetRotation.z, easedProgress)
      );
    }
  });

  // Easing function for smoother animation
  const easeOutBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  return (
    <mesh
      ref={meshRef}
      position={piece.originalPosition}
      rotation={piece.originalRotation}
      scale={piece.scale}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={isHovered ? 'hsl(45, 100%, 60%)' : piece.color}
        metalness={0.3}
        roughness={0.4}
        emissive={isHovered ? 'hsl(45, 100%, 30%)' : 'black'}
        emissiveIntensity={isHovered ? 0.5 : 0}
      />
    </mesh>
  );
};

const ExplodingCube = ({ isExploded, pieceCount = 27 }: ExplodingCubeProps) => {
  const groupRef = useRef<THREE.Group>(null);

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
            id: id,
            targetPosition: targetPos,
            originalPosition: originalPos.clone(),
            targetRotation: new THREE.Euler(
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4,
              Math.random() * Math.PI * 4
            ),
            originalRotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(pieceSize * 0.95, pieceSize * 0.95, pieceSize * 0.95),
            color: `hsl(${200 + id * 5}, 70%, 50%)`,
          });
          id++;
        }
      }
    }
    return piecesArray;
  }, [pieceCount]);

  return (
    <group ref={groupRef}>
      {pieces.map((piece) => (
        <PieceMesh
          key={piece.id}
          piece={piece}
          isGlobalExploded={isExploded}
        />
      ))}
    </group>
  );
};

export default ExplodingCube;
