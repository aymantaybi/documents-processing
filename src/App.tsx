import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from './components/layout/MainLayout';
import { SplitView } from './components/layout/SplitView';
import { Settings } from './components/settings/Settings';
import { PromptManager } from './components/prompt-manager/PromptManager';
import { DocumentImport } from './components/document-import/DocumentImport';
import { BatchProcessor } from './components/batch-processor/BatchProcessor';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/card';
import { initDB } from './services/storage/db';
import { useStore } from './store';
import { initializeOpenAI } from './services/openai/client';

function App() {
  const { i18n, t } = useTranslation('common');
  const apiKey = useStore((state) => state.openaiApiKey);
  const language = useStore((state) => state.language);
  const activePromptId = useStore((state) => state.activePromptId);
  const documents = useStore((state) => state.documents);

  const hasCompletedDocs = documents.some((doc) => doc.status === 'completed');

  useEffect(() => {
    // Initialize IndexedDB
    initDB().catch((error) => {
      console.error('Failed to initialize database:', error);
    });

    // Initialize OpenAI if API key exists
    if (apiKey) {
      initializeOpenAI(apiKey);
    }
  }, [apiKey]);

  // Sync language from store to i18next
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('appTitle')}</CardTitle>
            <CardDescription>
              {t('appDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Quick Start:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Set your OpenAI API key in Settings (⚙️ icon)</li>
                  <li>Create a prompt with JSON schema (Prompts button)</li>
                  <li>Import documents (PDF or images) below</li>
                  <li>Click "Process Documents" to extract data</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <DocumentImport />

        <BatchProcessor />

        {hasCompletedDocs && <SplitView promptId={activePromptId} />}
      </div>

      <Settings />
      <PromptManager />
    </MainLayout>
  );
}

export default App;
