import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Upload, Bomb, RotateCcw, Box } from 'lucide-react';

interface ControlPanelProps {
  isExploded: boolean;
  onExplode: () => void;
  onReset: () => void;
  onFileUpload: (url: string, fileName: string) => void;
  onUseDefaultCube: () => void;
  pieceCount: number;
  onPieceCountChange: (count: number) => void;
  glbFileName: string | null;
  hasGlbLoaded: boolean;
}

const ControlPanel = ({
  isExploded,
  onExplode,
  onReset,
  onFileUpload,
  onUseDefaultCube,
  pieceCount,
  onPieceCountChange,
  glbFileName,
  hasGlbLoaded,
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.glb')) {
      const url = URL.createObjectURL(file);
      onFileUpload(url, file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-background/80 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4">
          {/* File info */}
          {glbFileName && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>📦 {glbFileName}</span>
            </div>
          )}

          {/* Main controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="lg"
              onClick={handleUploadClick}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload GLB
            </Button>

            {/* Default cube button */}
            {hasGlbLoaded && (
              <Button
                variant="outline"
                size="lg"
                onClick={onUseDefaultCube}
                className="gap-2"
              >
                <Box className="h-4 w-4" />
                Default Cube
              </Button>
            )}

            {/* Explode / Reset button */}
            <Button
              variant={isExploded ? "secondary" : "default"}
              size="lg"
              onClick={isExploded ? onReset : onExplode}
              className="gap-2 min-w-[140px]"
            >
              {isExploded ? (
                <>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </>
              ) : (
                <>
                  <Bomb className="h-4 w-4" />
                  Explode!
                </>
              )}
            </Button>
          </div>

          {/* Piece count slider (only for default cube) */}
          {!hasGlbLoaded && (
            <div className="flex items-center gap-4 px-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Pieces: {pieceCount}
              </span>
              <Slider
                value={[pieceCount]}
                onValueChange={(value) => onPieceCountChange(value[0])}
                min={8}
                max={64}
                step={1}
                className="flex-1"
              />
            </div>
          )}

          {/* Instructions */}
          <p className="text-center text-xs text-muted-foreground">
            🖱️ Drag to rotate • Scroll to zoom • Upload .glb file or use default cube
          </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
