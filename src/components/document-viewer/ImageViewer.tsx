import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ImageViewerProps {
  file: File;
}

export const ImageViewer = ({ file }: ImageViewerProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 25));
  };

  if (!imageUrl) {
    return (
      <div className="text-center text-muted-foreground">
        Loading image...
      </div>
    );
  }

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
          src={imageUrl}
          alt={file.name}
          style={{ width: `${zoom}%`, height: 'auto' }}
          className="shadow-lg rounded"
        />
      </div>
    </div>
  );
};
