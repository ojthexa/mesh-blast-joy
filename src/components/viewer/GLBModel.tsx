import { useRef, useMemo, useState } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface MeshPiece {
  id: string;
  mesh: THREE.Mesh;
  targetPosition: THREE.Vector3;
  originalPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  originalRotation: THREE.Euler;
}

interface GLBModelProps {
  url: string;
  isExploded: boolean;
}

interface GLBPieceMeshProps {
  piece: MeshPiece;
  isGlobalExploded: boolean;
}

const GLBPieceMesh = ({ piece, isGlobalExploded }: GLBPieceMeshProps) => {
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

  // Easing function
  const easeOutBack = (x: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };

  const handlePointerEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Clone the mesh and modify its material for hover effect
  const clonedMesh = useMemo(() => {
    const clone = piece.mesh.clone();
    return clone;
  }, [piece.mesh]);

  return (
    <primitive
      ref={meshRef}
      object={clonedMesh}
      position={piece.originalPosition}
      rotation={piece.originalRotation}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    />
  );
};

const GLBModel = ({ url, isExploded }: GLBModelProps) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  const pieces = useMemo(() => {
    const meshPieces: MeshPiece[] = [];
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const worldPosition = new THREE.Vector3();
        child.getWorldPosition(worldPosition);
        
        // Random explosion target position
        const explosionDirection = worldPosition.clone().normalize();
        if (explosionDirection.length() === 0) {
          explosionDirection.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize();
        }
        
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 6 + 2,
          (Math.random() - 0.5) * 8
        );
        const targetPos = explosionDirection.multiplyScalar(3 + Math.random() * 4).add(randomOffset);

        meshPieces.push({
          id: child.uuid,
          mesh: child.clone(),
          targetPosition: targetPos,
          originalPosition: worldPosition.clone(),
          targetRotation: new THREE.Euler(
            Math.random() * Math.PI * 4,
            Math.random() * Math.PI * 4,
            Math.random() * Math.PI * 4
          ),
          originalRotation: new THREE.Euler(
            child.rotation.x,
            child.rotation.y,
            child.rotation.z
          ),
        });
      }
    });
    
    return meshPieces;
  }, [scene]);

  if (pieces.length === 0) {
    return <primitive object={scene} />;
  }

  return (
    <group ref={groupRef}>
      {pieces.map((piece) => (
        <GLBPieceMesh
          key={piece.id}
          piece={piece}
          isGlobalExploded={isExploded}
        />
      ))}
    </group>
  );
};

export default GLBModel;
