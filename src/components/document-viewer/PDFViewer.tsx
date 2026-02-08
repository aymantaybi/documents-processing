import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  imageData: string[];
  pageNumber: number;
}

export const PDFViewer = ({ imageData, pageNumber }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);

  const currentImage = imageData[pageNumber - 1];

  if (!currentImage) {
    return (
      <div className="text-center text-muted-foreground">
        Page not found
      </div>
    );
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 25));
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground w-16 text-center">
          {zoom}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 400}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center justify-center overflow-auto flex-1 min-h-0">
        <img
          src={currentImage}
          alt={`Page ${pageNumber}`}
          style={{ width: `${zoom}%`, height: 'auto' }}
          className="shadow-lg rounded"
        />
      </div>
    </div>
  );
};
