import { useState, useCallback } from 'react';
import ViewerScene from './ViewerScene';
import ControlPanel from './ControlPanel';

const GLBViewer = () => {
  const [isExploded, setIsExploded] = useState(false);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [glbFileName, setGlbFileName] = useState<string | null>(null);
  const [pieceCount, setPieceCount] = useState(27);

  const handleExplode = useCallback(() => {
    setIsExploded(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsExploded(false);
  }, []);

  const handleFileUpload = useCallback((url: string, fileName: string) => {
    // Clean up previous URL if exists
    if (glbUrl) {
      URL.revokeObjectURL(glbUrl);
    }
    setGlbUrl(url);
    setGlbFileName(fileName);
    setIsExploded(false);
  }, [glbUrl]);

  const handleUseDefaultCube = useCallback(() => {
    if (glbUrl) {
      URL.revokeObjectURL(glbUrl);
    }
    setGlbUrl(null);
    setGlbFileName(null);
    setIsExploded(false);
  }, [glbUrl]);

  const handlePieceCountChange = useCallback((count: number) => {
    setPieceCount(count);
    setIsExploded(false);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* 3D Canvas */}
      <ViewerScene
        glbUrl={glbUrl}
        isExploded={isExploded}
        pieceCount={pieceCount}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6">
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            🎮 GLB Viewer
          </h1>
          <p className="text-sm text-white/70 mt-1">
            3D Model Viewer with Explosion Effect
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        isExploded={isExploded}
        onExplode={handleExplode}
        onReset={handleReset}
        onFileUpload={handleFileUpload}
        onUseDefaultCube={handleUseDefaultCube}
        pieceCount={pieceCount}
        onPieceCountChange={handlePieceCountChange}
        glbFileName={glbFileName}
        hasGlbLoaded={glbUrl !== null}
      />
    </div>
  );
};

export default GLBViewer;
