import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store';
import { RowJsonViewer } from './RowJsonViewer';
import { setNestedValue } from '@/utils/json';
import { updateResultEditedData } from '@/services/storage/results';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface DataTableProps {
  promptId: string | null;
}

export const DataTable = ({ promptId }: DataTableProps) => {
  const { t } = useTranslation('common');
  const prompts = useStore((state) => state.prompts);
  const documents = useStore((state) => state.documents);
  const results = useStore((state) => state.results);
  const updateResult = useStore((state) => state.updateResult);
  const currentIndex = useStore((state) => state.currentIndex);
  const setCurrentIndex = useStore((state) => state.setCurrentIndex);

  const activePrompt = prompts.find((p) => p.id === promptId);

  // Get completed documents with results
  const completedDocs = documents.filter((doc) => doc.status === 'completed');
  const docsWithResults = completedDocs
    .map((doc, index) => {
      const result = results[doc.id];
      if (!result) return null;

      const dataToDisplay = result.editedData || result.data;
      const hasErrors = (result.validationErrors?.length ?? 0) > 0;

      return {
        doc,
        data: dataToDisplay,
        hasErrors,
        validationErrors: result.validationErrors,
        index,
      };
    })
    .filter(Boolean) as Array<{
    doc: typeof completedDocs[0];
    data: Record<string, unknown>;
    hasErrors: boolean;
    validationErrors?: Array<{ field: string; message?: string }>;
    index: number;
  }>;

  const handleSave = async (documentId: string, path: string[], newValue: unknown) => {
    try {
      const result = results[documentId];
      if (!result) return;

      // Get the current data (edited or original)
      const currentData = result.editedData || result.data;

      // Create a deep copy and update the value at the specified path
      const updatedData = JSON.parse(JSON.stringify(currentData));
      setNestedValue(updatedData, path.join('.'), newValue);

      // Save to IndexedDB
      await updateResultEditedData(documentId, updatedData);

      // Update store
      updateResult(documentId, updatedData);

      toast.success(t('dataTable.valueUpdated'));
    } catch (error) {
      console.error('Failed to update value:', error);
      toast.error(t('dataTable.failedToUpdate'));
    }
  };

  if (!activePrompt) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('dataTable.noActivePrompt')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (docsWithResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dataTable.title')}</CardTitle>
          <CardDescription>{t('dataTable.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {t('dataTable.noProcessedDocuments')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('dataTable.title')}</CardTitle>
          <CardDescription>
            {t('dataTable.documentsProcessed', { count: docsWithResults.length })}
            {' · '}
            {t('dataTable.doubleClickToEdit')}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {docsWithResults.map(({ doc, data, hasErrors, validationErrors, index }) => (
          <Card
            key={doc.id}
            className={cn(
              'transition-all cursor-pointer hover:shadow-md flex flex-col max-h-[calc(100vh-20rem)]',
              currentIndex === index && 'border-2 border-primary shadow-lg'
            )}
            onClick={() => setCurrentIndex(index)}
          >
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{doc.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {hasErrors ? (
                        <>
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          <span className="text-destructive text-xs">
                            {validationErrors?.length} {t('validation.errors').toLowerCase()}
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 text-xs">Valid</span>
                        </>
                      )}
                      {doc.processedAt && (
                        <>
                          <span>•</span>
                          <span className="text-xs">
                            {new Date(doc.processedAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0 flex-1 overflow-y-auto">
              {hasErrors && validationErrors && validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-xs font-medium text-destructive mb-2">
                    {t('validation.errors')}:
                  </p>
                  <ul className="space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx} className="text-xs text-destructive/80 flex gap-2">
                        <span className="font-mono">{error.field || 'unknown'}:</span>
                        <span>{error.message || 'Validation failed'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <RowJsonViewer
                  data={data}
                  path={[]}
                  editable={true}
                  onSave={(path, newValue) => handleSave(doc.id, path, newValue)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
