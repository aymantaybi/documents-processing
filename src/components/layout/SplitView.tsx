import { useState, useRef, useEffect } from 'react';
import { DataTable } from '@/components/data-table/DataTable';
import { DocumentViewer } from '@/components/document-viewer/DocumentViewer';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

interface SplitViewProps {
  promptId: string | null;
}

export const SplitView = ({ promptId }: SplitViewProps) => {
  const splitViewRatio = useStore((state) => state.splitViewRatio);
  const setSplitViewRatio = useStore((state) => state.setSplitViewRatio);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newRatio = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 30% and 70%
      const constrainedRatio = Math.min(70, Math.max(30, newRatio));
      setSplitViewRatio(constrainedRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setSplitViewRatio]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  return (
    <div ref={containerRef} className="flex gap-4 h-[calc(100vh-16rem)] sticky top-4">
      {/* Left Panel - Data Table */}
      <div style={{ width: `${splitViewRatio}%` }} className="min-w-0 overflow-y-auto">
        <DataTable promptId={promptId} />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'w-1 bg-border hover:bg-primary/50 cursor-col-resize transition-colors flex-shrink-0',
          isDragging && 'bg-primary'
        )}
      />

      {/* Right Panel - Document Viewer */}
      <div style={{ width: `${100 - splitViewRatio - 0.5}%` }} className="min-w-0 overflow-y-auto">
        <DocumentViewer promptId={promptId} />
      </div>
    </div>
  );
};
