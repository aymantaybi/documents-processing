import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, AlertCircle } from 'lucide-react';
import { useStore } from '@/store';
import { processDocument } from '@/services/openai/processor';
import { convertPDFToImages } from '@/services/pdf/converter';
import { loadImageAsBase64 } from '@/services/pdf/loader';
import { saveDocument } from '@/services/storage/documents';
import { saveResult } from '@/services/storage/results';
import { isOpenAIInitialized } from '@/services/openai/client';
import { validateAgainstSchema } from '@/services/validation/validator';
import toast from 'react-hot-toast';

export const BatchProcessor = () => {
  const { t } = useTranslation('batch');
  const documents = useStore((state) => state.documents);
  const activePromptId = useStore((state) => state.activePromptId);
  const prompts = useStore((state) => state.prompts);
  const updateDocument = useStore((state) => state.updateDocument);
  const setResult = useStore((state) => state.setResult);
  const rateLimit = useStore((state) => state.rateLimit);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, failed: 0, total: 0 });
  const [currentDoc, setCurrentDoc] = useState<string | null>(null);

  const activePrompt = prompts.find((p) => p.id === activePromptId);
  const pendingDocs = documents.filter((d) => d.status === 'pending' && d.selected);

  const handleProcess = async () => {
    if (!isOpenAIInitialized()) {
      toast.error(t('errors.noApiKey'));
      return;
    }

    if (!activePrompt) {
      toast.error(t('errors.noActivePrompt'));
      return;
    }

    if (pendingDocs.length === 0) {
      toast.error(t('errors.noDocuments'));
      return;
    }

    setIsProcessing(true);
    setProgress({ completed: 0, failed: 0, total: pendingDocs.length });

    for (const doc of pendingDocs) {
      setCurrentDoc(doc.name);

      try {
        // Update status to processing
        updateDocument(doc.id, { status: 'processing' });
        await saveDocument({ ...doc, status: 'processing' });

        // Convert PDF to images or load image
        let images: string[];
        if (doc.type === 'pdf') {
          if (doc.imageData) {
            images = doc.imageData;
          } else {
            images = await convertPDFToImages(doc.file);
            updateDocument(doc.id, { imageData: images });
            await saveDocument({ ...doc, imageData: images });
          }
        } else {
          images = [await loadImageAsBase64(doc.file)];
        }

        // Process with OpenAI
        const result = await processDocument({
          imageData: images,
          systemPrompt: activePrompt.systemPrompt,
          jsonSchema: activePrompt.jsonSchema,
          rateLimit,
        });

        // Validate result
        const validation = validateAgainstSchema(result, activePrompt.jsonSchema);

        const extractedData = {
          documentId: doc.id,
          data: result,
          validationErrors: validation.valid
            ? undefined
            : validation.errors?.map((e) => ({
                field: e.instancePath,
                message: e.message,
              })),
        };

        // Save result
        await saveResult(extractedData);
        setResult(doc.id, extractedData);

        // Update document status and deselect
        updateDocument(doc.id, {
          status: 'completed',
          processedAt: new Date(),
          selected: false,
        });
        await saveDocument({
          ...doc,
          status: 'completed',
          processedAt: new Date(),
          selected: false,
        });

        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
        toast.success(t('messages.processed', { name: doc.name }));
      } catch (error: any) {
        console.error('Processing error:', error);

        updateDocument(doc.id, {
          status: 'error',
          error: error.message,
        });
        await saveDocument({
          ...doc,
          status: 'error',
          error: error.message,
        });

        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
        toast.error(t('messages.failed', { name: doc.name }));
      }
    }

    setCurrentDoc(null);
    setIsProcessing(false);
    toast.success(t('messages.batchComplete'));
  };

  if (!activePrompt) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {t('errors.noActivePromptMessage')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>
          {t('activePrompt', { name: activePrompt.name })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isProcessing && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {t('readyToProcess', { count: pendingDocs.length })}
            </div>
            <Button
              onClick={handleProcess}
              disabled={pendingDocs.length === 0 || !isOpenAIInitialized()}
            >
              <Play className="mr-2 h-4 w-4" />
              {t('processDocuments')}
            </Button>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t('progress.processing')}</span>
                <span className="font-medium">
                  {progress.completed + progress.failed} / {progress.total}
                </span>
              </div>
              <Progress
                value={
                  ((progress.completed + progress.failed) / progress.total) * 100
                }
              />
            </div>

            {currentDoc && (
              <div className="text-sm text-muted-foreground">
                {t('progress.current', { name: currentDoc })}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">
                {t('progress.completedCount', { count: progress.completed })}
              </span>
              {progress.failed > 0 && (
                <span className="text-red-600">{t('progress.failedCount', { count: progress.failed })}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
