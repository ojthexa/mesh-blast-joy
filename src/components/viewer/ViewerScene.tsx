import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Center } from '@react-three/drei'
import OrganicRockChunks from './OrganicRockChunks'
import GLBModel from './GLBModel'

interface ViewerSceneProps {
  glbUrl: string | null;
  isExploded: boolean;
  pieceCount: number;
}

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="hsl(220, 70%, 50%)" wireframe />
  </mesh>
);

const ViewerScene = ({ glbUrl, isExploded, pieceCount }: ViewerSceneProps) => {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 50 }}
      style={{ background: 'linear-gradient(180deg, hsl(220, 30%, 15%) 0%, hsl(220, 40%, 8%) 100%)' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Grid floor */}
      <Grid
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="hsl(220, 30%, 25%)"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="hsl(220, 40%, 35%)"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        position={[0, -1.5, 0]}
      />

      {/* Model */}
      <Center>
        <Suspense fallback={<LoadingFallback />}>
          {glbUrl ? (
            <GLBModel url={glbUrl} isExploded={isExploded} />
          ) : (
            <OrganicRockChunks chunkCount={12} />
          )}
        </Suspense>
      </Center>

      {/* Camera Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={20}
        autoRotate={!isExploded}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default ViewerScene;
