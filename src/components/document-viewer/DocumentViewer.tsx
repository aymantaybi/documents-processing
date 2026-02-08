import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';

interface DocumentViewerProps {
  promptId: string | null;
}

export const DocumentViewer = ({ promptId }: DocumentViewerProps) => {
  const documents = useStore((state) => state.documents);
  const currentIndex = useStore((state) => state.currentIndex);
  const navigateNext = useStore((state) => state.navigateNext);
  const navigatePrevious = useStore((state) => state.navigatePrevious);
  const [pageNumber, setPageNumber] = useState(1);

  // Get completed documents
  const completedDocs = documents.filter((doc) => doc.status === 'completed');
  const currentDoc = completedDocs[currentIndex];

  // Reset page number when document changes
  useEffect(() => {
    setPageNumber(1);
  }, [currentIndex]);

  if (!promptId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No active prompt selected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedDocs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Document Viewer</CardTitle>
          <CardDescription>View processed documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No documents to display. Process documents to view them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentDoc) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Document not found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handlePrevious = () => {
    if (currentDoc.type === 'pdf' && pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    } else if (currentDoc.type === 'pdf' && pageNumber === 1) {
      navigatePrevious();
    } else {
      navigatePrevious();
    }
  };

  const handleNext = () => {
    if (currentDoc.type === 'pdf' && currentDoc.imageData && pageNumber < currentDoc.imageData.length) {
      setPageNumber(pageNumber + 1);
    } else if (currentDoc.type === 'pdf' && currentDoc.imageData && pageNumber === currentDoc.imageData.length) {
      navigateNext(completedDocs.length - 1);
      setPageNumber(1);
    } else {
      navigateNext(completedDocs.length - 1);
    }
  };

  const totalPages = currentDoc.type === 'pdf' && currentDoc.imageData
    ? currentDoc.imageData.length
    : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{currentDoc.name}</CardTitle>
            <CardDescription>
              Document {currentIndex + 1} of {completedDocs.length}
              {currentDoc.type === 'pdf' && ` • Page ${pageNumber} of ${totalPages}`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0 && pageNumber === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === completedDocs.length - 1 && pageNumber === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
          {currentDoc.type === 'pdf' && currentDoc.imageData ? (
            <PDFViewer
              imageData={currentDoc.imageData}
              pageNumber={pageNumber}
            />
          ) : (
            <ImageViewer file={currentDoc.file} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
