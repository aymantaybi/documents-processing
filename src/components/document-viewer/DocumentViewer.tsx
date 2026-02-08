import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['document', 'common']);
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
              {t('document:viewer.noActivePrompt')}
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
          <CardTitle>{t('document:viewer.title')}</CardTitle>
          <CardDescription>{t('document:viewer.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('document:viewer.noDocuments')}
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
              {t('document:viewer.documentNotFound')}
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
    <Card className="flex flex-col h-[calc(100vh-20rem)]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{currentDoc.name}</CardTitle>
            <CardDescription>
              {t('document:viewer.documentCount', { current: currentIndex + 1, total: completedDocs.length })}
              {currentDoc.type === 'pdf' && ` • ${t('document:viewer.page', { current: pageNumber, total: totalPages })}`}
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
              {t('common:buttons.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === completedDocs.length - 1 && pageNumber === totalPages}
            >
              {t('common:buttons.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="bg-muted/30 rounded-lg p-4 min-h-full flex items-center justify-center">
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
